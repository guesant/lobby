import { medianResult } from '../lighthouse-baseline/median-result.ts';
import { assertLighthouse } from './assert-lighthouse.ts';
import type { LighthouseResult } from './lighthouse-audit.types.ts';
import { runLighthouse } from './run-lighthouse.ts';

export async function runMedianLighthouse(
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

  for (const result of results) {
    assertLighthouse({
      ...result,
      scores: median.scores,
    });
  }

  return median;
}
