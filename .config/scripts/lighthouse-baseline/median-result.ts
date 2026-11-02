import type { LighthouseResult } from '../lighthouse-audit.ts';
import { compareScores } from './compare-scores.ts';
import { medianScore } from './median-score.ts';

export function medianResult(results: LighthouseResult[]): LighthouseResult {
  const first = results[0];

  if (!first || results.length !== 3) {
    throw new Error('Expected three Lighthouse measurements');
  }

  const scores: Record<string, number> = {};

  for (const key of Object.keys(first.scores)) {
    scores[key] = medianScore(results, {
      first,
      key,
      compare: compareScores,
    });
  }

  return {
    ...first,
    scores,
  };
}
