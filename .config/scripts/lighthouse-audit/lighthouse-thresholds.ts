import { record } from '../../../website/src/lib/features/content/validation.model.ts';
import { lighthouseConfiguration } from './lighthouse-configuration.ts';
import { scoreValue } from './score-value.ts';

export function lighthouseThresholds(): Record<string, number> {
  const thresholds: Record<string, number> = {};

  const configuration = lighthouseConfiguration();

  const assertions = configuration.ci.assert.assertions;

  for (const [
    key,
    assertion,
  ] of Object.entries(assertions)) {
    if (assertion === 'off') {
      continue;
    }

    if (!Array.isArray(assertion) || assertion[0] !== 'error') {
      throw new Error(`Invalid Lighthouse assertion: ${key}`);
    }

    const threshold = record(assertion[1], 'Lighthouse threshold');

    const score = scoreValue(threshold['minScore'], `threshold: ${key}`);

    thresholds[key.replace('categories:', '')] = score;
  }

  return thresholds;
}
