import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import {
  assertLighthouse,
  runLighthouse,
  type LighthouseResult,
} from './lighthouse-audit.ts';
import { withStaticServer } from './static-server.ts';

function medianResult(results: LighthouseResult[]): LighthouseResult {
  const first = results[0];

  if (!first || results.length !== 3) {
    throw new Error('Expected three Lighthouse measurements');
  }

  const scores: Record<string, number> = {};

  for (const key of Object.keys(first.scores)) {
    const values = results
      .map((result): number => {
        const score = result.scores[key];

        if (
          score === undefined ||
          result.formFactor !== first.formFactor ||
          result.path !== first.path
        ) {
          throw new Error('Inconsistent Lighthouse measurements');
        }

        return score;
      })
      .sort((left, right): number => {
        return left - right;
      });

    const median = values[1];

    if (median === undefined) {
      throw new Error('Missing Lighthouse median');
    }

    scores[key] = median;
  }

  return {
    ...first,
    scores,
  };
}

const summary: LighthouseResult[] = [];

await withStaticServer(async (): Promise<void> => {
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
        const output = resolve(
          '.local/reports/lighthouse-baseline',
          formFactor,
          path.slice(1),
          `run-${run}`,
        );

        results.push(
          await runLighthouse(
            `http://127.0.0.1:4173${path}`,
            output,
            formFactor,
          ),
        );
      }

      const median = medianResult(results);

      console.log(JSON.stringify(median));
      summary.push(median);
      assertLighthouse(median);
    }
  }
}, '.local/build/lighthouse-baseline');

await writeFile(
  '.local/reports/lighthouse-baseline/results.json',
  JSON.stringify(summary, null, 2),
);
