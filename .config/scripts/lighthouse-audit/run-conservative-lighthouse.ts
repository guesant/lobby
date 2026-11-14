import { medianResult } from '../lighthouse-baseline/median-result.ts';
import { assertLighthouse } from './assert-lighthouse.ts';
import type { LighthouseResult } from './lighthouse-audit.types.ts';
import { lighthouseFailures } from './lighthouse-failures.ts';
import { runLighthouse } from './run-lighthouse.ts';

export async function runConservativeLighthouse(
  url: string,
  output: string,
): Promise<LighthouseResult> {
  const first = await runLighthouse(url, `${output}-run-1`);

  console.log({
    run: 1,
    ...first,
  });

  const second = await runLighthouse(url, `${output}-run-2`);

  console.log({
    run: 2,
    ...second,
  });

  const conservative: LighthouseResult = {
    ...first,
    scores: {},
  };

  for (const key of Object.keys(first.scores)) {
    const firstScore = first.scores[key];
    const secondScore = second.scores[key];

    if (
      firstScore === undefined ||
      secondScore === undefined ||
      first.path !== second.path ||
      first.formFactor !== second.formFactor
    ) {
      throw new Error('Inconsistent Lighthouse measurements');
    }

    conservative.scores[key] = Math.min(firstScore, secondScore);
  }

  if (!lighthouseFailures(conservative).length) {
    assertLighthouse(conservative);

    return conservative;
  }

  const third = await runLighthouse(url, `${output}-run-3`);

  console.log({
    run: 3,
    ...third,
  });

  const results = [
    first,
    second,
    third,
  ];

  const median = medianResult(results);

  assertLighthouse(median);

  return median;
}
