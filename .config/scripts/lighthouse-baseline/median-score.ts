import type { LighthouseResult } from '../lighthouse-audit.types.ts';

export function medianScore(
  results: LighthouseResult[],
  options: {
    first: LighthouseResult;
    key: string;
    compare: (left: number, right: number) => number;
  },
): number {
  const values: number[] = [];

  for (const result of results) {
    const score = result.scores[options.key];

    if (
      score === undefined ||
      result.formFactor !== options.first.formFactor ||
      result.path !== options.first.path
    ) {
      throw new Error('Inconsistent Lighthouse measurements');
    }

    values.push(score);
  }

  values.sort(options.compare);

  const median = values[1];

  if (median === undefined) {
    throw new Error('Missing Lighthouse median');
  }

  return median;
}
