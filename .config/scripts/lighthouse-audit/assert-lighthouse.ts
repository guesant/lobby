import type { LighthouseResult } from './lighthouse-audit.types.ts';
import { lighthouseThresholds } from './lighthouse-thresholds.ts';

export function assertLighthouse(result: LighthouseResult): void {
  const thresholds = lighthouseThresholds();

  for (const [
    key,
    threshold,
  ] of Object.entries(thresholds)) {
    const score = result.scores[key];

    if (score === undefined || score < threshold) {
      throw new Error(
        `Lighthouse ${result.formFactor} ${result.path} ${key}: ${String(score)}, minimum ${String(threshold)}`,
      );
    }
  }
}
