import { medianResult } from '../lighthouse-baseline/median-result.ts';
import { assertLighthouse } from './assert-lighthouse.ts';
import type { LighthouseResult } from './lighthouse-audit.types.ts';
import { runLighthouse } from './run-lighthouse.ts';

export async function runHomepageLighthouse(
  url: string,
  output: string,
): Promise<LighthouseResult> {
  const results: LighthouseResult[] = [];

  for (let run = 1; run <= 3; run += 1) {
    const runLabel = String(run);

    const result = await runLighthouse(url, `${output}-run-${runLabel}`);

    results.push(result);
    console.log({
      run,
      ...result,
    });
  }

  const median = medianResult(results);

  const performance = median.scores['performance'];

  if (performance === undefined) {
    throw new Error('Missing median Lighthouse performance score');
  }

  for (const result of results) {
    assertLighthouse({
      ...result,
      scores: {
        ...result.scores,
        performance,
      },
    });
  }

  return median;
}
