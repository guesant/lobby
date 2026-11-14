import type { readConfiguration } from '../configuration.ts';
import { assertLighthouse } from './assert-lighthouse.ts';
import { auditPageURLs } from './audit-page-urls.ts';
import type { LighthouseResult } from './lighthouse-audit.types.ts';
import { runMedianLighthouse } from './run-median-lighthouse.ts';
import { resolve } from 'node:path';

export async function runAuditPages(
  data: ReturnType<typeof readConfiguration>,
  results: LighthouseResult[],
): Promise<void> {
  const urls = auditPageURLs(data);

  for (const [
    index,
    path,
  ] of urls.entries()) {
    const reportIndex = String(index)
      .padStart(2, '0');

    const output = resolve('.cache/lighthouseci/reports', reportIndex);

    const url = `http://127.0.0.1:4173${path}`;

    const result = await runMedianLighthouse(url, output);

    results.push(result);

    const serializedResult = JSON.stringify(result);

    console.log(serializedResult);
    assertLighthouse(result);
  }
}
