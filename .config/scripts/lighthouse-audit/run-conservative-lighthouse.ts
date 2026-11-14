import { medianResult } from '../lighthouse-baseline/median-result.ts';
import { assertLighthouse } from './assert-lighthouse.ts';
import { conservativeLighthouseResult } from './conservative-lighthouse-result.ts';
import type { LighthouseResult } from './lighthouse-audit.types.ts';
import { lighthouseFailures } from './lighthouse-failures.ts';
import { runLighthouseSample } from './run-lighthouse-sample.ts';

export async function runConservativeLighthouse(
  url: string,
  output: string,
): Promise<LighthouseResult> {
  const first = await runLighthouseSample(url, `${output}-run-1`, 1);

  const second = await runLighthouseSample(url, `${output}-run-2`, 2);

  const conservative = conservativeLighthouseResult(first, second);

  if (!lighthouseFailures(conservative).length) {
    assertLighthouse(conservative);

    return conservative;
  }

  const third = await runLighthouseSample(url, `${output}-run-3`, 3);

  const results = [
    first,
    second,
    third,
  ];

  const median = medianResult(results);

  assertLighthouse(median);

  return median;
}
