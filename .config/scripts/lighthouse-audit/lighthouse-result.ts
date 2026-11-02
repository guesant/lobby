import { record } from '../../../website/src/lib/features/content/validation.model.ts';
import type { LighthouseResult } from './lighthouse-audit.types.ts';
import { lighthouseScores } from './lighthouse-scores.ts';

export function lighthouseResult(value: unknown): LighthouseResult {
  const report = record(value, 'Lighthouse result');

  if (report['runtimeError']) {
    throw new Error(
      `Lighthouse runtime error: ${JSON.stringify(report['runtimeError'])}`,
    );
  }

  const settings = record(report['configSettings'], 'Lighthouse settings');

  if (
    settings['formFactor'] !== 'mobile' &&
    settings['formFactor'] !== 'desktop'
  ) {
    throw new Error('Invalid Lighthouse form factor');
  }

  if (typeof report['finalUrl'] !== 'string') {
    throw new Error('Missing Lighthouse URL');
  }

  const scores = lighthouseScores(report['categories']);

  return {
    path: new URL(report['finalUrl']).pathname,
    formFactor: settings['formFactor'],
    scores,
  };
}
