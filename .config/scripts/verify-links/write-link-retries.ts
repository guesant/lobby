import type { VerifiedLink } from './verify-links.types.ts';
import { writeFile } from 'node:fs/promises';

export function writeLinkRetries(verified: VerifiedLink[]): Promise<void> {
  const timestamp = new Date()
    .toISOString();

  const report = {
    verified,
    checked_at: timestamp,
  };

  const serializedReport = JSON.stringify(report, null, 2);

  return writeFile('.local/reports/link-retries.json', serializedReport);
}
