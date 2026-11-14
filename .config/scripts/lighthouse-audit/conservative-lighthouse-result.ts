import type { LighthouseResult } from './lighthouse-audit.types.ts';

export function conservativeLighthouseResult(
  first: LighthouseResult,
  second: LighthouseResult,
): LighthouseResult {
  if (first.path !== second.path || first.formFactor !== second.formFactor) {
    throw new Error('Inconsistent Lighthouse measurements');
  }

  const result: LighthouseResult = {
    ...first,
    scores: {},
  };

  for (const key of Object.keys(first.scores)) {
    const firstScore = first.scores[key];

    const secondScore = second.scores[key];

    if (firstScore === undefined || secondScore === undefined) {
      throw new Error('Inconsistent Lighthouse measurements');
    }

    result.scores[key] = Math.min(firstScore, secondScore);
  }

  return result;
}
