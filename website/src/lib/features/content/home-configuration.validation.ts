import type { LinkDocument } from './content.types.ts';
import { record, requiredBoolean } from './validation.model.ts';

export function homeConfiguration(value: unknown): LinkDocument['home'] {
  const home = record(value, 'links.home');

  return {
    illustration_enabled: requiredBoolean(
      home['illustration_enabled'],
      'links.home.illustration_enabled',
    ),
  };
}
