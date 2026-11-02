import { readLinkReport } from './read-link-report.ts';
import { runLinkChecker } from './run-link-checker.ts';
import type { VerifiedLink } from './verify-links.types.ts';
import { verifyTransientFailures } from './verify-transient-failures.ts';
import { writeLinkRetries } from './write-link-retries.ts';
import { writeLinkSummary } from './write-link-summary.ts';
import { resolve } from 'node:path';
import { setTimeout } from 'node:timers/promises';

export async function runLinkVerification(): Promise<void> {
  const reportPath = resolve('.local/reports/links.json');

  const result = await runLinkChecker(reportPath);

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0 && result.status !== 2) {
    throw new Error(`Link checker failed: ${String(result.status)}`);
  }

  const report = await readLinkReport(reportPath);

  const unique = report.unique;

  let verified: VerifiedLink[] = [];

  if (result.status !== 0) {
    await setTimeout(2000);
    verified = await verifyTransientFailures(report.report);
  }

  await writeLinkRetries(verified);

  writeLinkSummary(unique, verified);
}
