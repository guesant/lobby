import {
  array,
  record,
  requiredText,
} from '../../../website/src/lib/features/content/validation.model.ts';
import type { LinkFailure } from './verify-links.types.ts';

export function reportFailures(report: Record<string, unknown>): LinkFailure[] {
  const failures: LinkFailure[] = [];

  const errors = record(report['error_map'] ?? {}, 'link errors');

  for (const entry of Object.values(errors)) {
    for (const value of array(entry, 'link failures')) {
      const failure = record(value, 'link failure');

      const status = record(failure['status'], 'link failure status');

      const code = status['code'];

      if (typeof code !== 'number') {
        throw new Error('Invalid link status');
      }

      const url = requiredText(failure['url'], 'link failure URL');

      failures.push({
        url,
        status: {
          code,
        },
      });
    }
  }

  return failures;
}
