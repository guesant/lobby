import type { LighthouseResult } from '../lighthouse-audit.types.ts';
import { withStaticServer } from '../static-server.ts';
import { runMeasurements } from './run-measurements.ts';
import { writeFile } from 'node:fs/promises';

export async function runBaseline(): Promise<void> {
  const summary: LighthouseResult[] = [];

  const measure = runMeasurements.bind(null, summary);

  await withStaticServer(measure, '.local/build/lighthouse-baseline');

  const serializedSummary = JSON.stringify(summary, null, 2);

  await writeFile(
    '.local/reports/lighthouse-baseline/results.json',
    serializedSummary,
  );
}
