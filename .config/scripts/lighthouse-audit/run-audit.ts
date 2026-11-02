import { readConfiguration } from '../configuration.ts';
import { withStaticServer } from '../static-server.ts';
import type { LighthouseResult } from './lighthouse-audit.types.ts';
import { runAuditPages } from './run-audit-pages.ts';
import { writeFile } from 'node:fs/promises';

export async function runAudit(): Promise<void> {
  const data = readConfiguration();

  const results: LighthouseResult[] = [];

  const auditPages = runAuditPages.bind(null, data, results);

  await withStaticServer(auditPages, '.local/build/lighthouse');

  const serializedResults = JSON.stringify(results, null, 2);

  await writeFile('.cache/lighthouseci/results.json', serializedResults);
}
