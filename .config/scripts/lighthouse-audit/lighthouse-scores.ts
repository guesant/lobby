import { record } from '../../../website/src/lib/features/content/validation.model.ts';
import { lighthouseThresholds } from './lighthouse-thresholds.ts';
import { scoreValue } from './score-value.ts';

export function lighthouseScores(value: unknown): Record<string, number> {
  const categories = record(value, 'Lighthouse categories');

  const scores: Record<string, number> = {};

  const thresholds = lighthouseThresholds();

  for (const key of Object.keys(thresholds)) {
    const category = record(categories[key], `Lighthouse ${key}`);

    const score = scoreValue(category['score'], `score: ${key}`);

    scores[key] = score;
  }

  return scores;
}
