import { assertLighthouse, runLighthouse } from '../lighthouse-audit.ts';
import type { LighthouseResult } from '../lighthouse-audit.types.ts';
import { medianResult } from './median-result.ts';
import { resolve } from 'node:path';

export async function runMeasurements(
  summary: LighthouseResult[],
): Promise<void> {
  for (const formFactor of [
    'mobile',
    'desktop',
  ] as const) {
    for (const path of [
      '/pt-br/',
      '/pt-br/code/',
      '/pt-br/terminal/',
      '/pt-br/terminal/code/',
    ]) {
      const results: LighthouseResult[] = [];

      for (let run = 0; run < 3; run += 1) {
        const pagePath = path.slice(1);

        const runLabel = String(run);

        const runDirectory = `run-${runLabel}`;

        const output = resolve(
          '.local/reports/lighthouse-baseline',
          formFactor,
          pagePath,
          runDirectory,
        );

        const result = await runLighthouse(
          `http://127.0.0.1:4173${path}`,
          output,
          formFactor,
        );

        results.push(result);
      }

      const median = medianResult(results);

      const serializedMedian = JSON.stringify(median);

      console.log(serializedMedian);
      summary.push(median);
      assertLighthouse(median);
    }
  }
}
