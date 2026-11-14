import type { LighthouseResult } from './lighthouse-audit.types.ts';
import { lighthouseThresholds } from './lighthouse-thresholds.ts';

export function lighthouseFailures(result: LighthouseResult): string[] {
  const failures: string[] = [];

  const thresholds = lighthouseThresholds();

  for (const [
    key,
    threshold,
  ] of Object.entries(thresholds)) {
    const score = result.scores[key];

    if (score === undefined || score < threshold) {
      failures.push(key);
    }
  }

  return failures;
}
