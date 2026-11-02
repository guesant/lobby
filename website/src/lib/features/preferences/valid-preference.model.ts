import { preferenceOptions } from './preference-options.model.ts';
import type { Preferences } from './preferences.types.ts';

export function validPreference<Key extends keyof Preferences>(
  key: Key,
  value: string,
): value is Preferences[Key] {
  for (const option of preferenceOptions[key]) {
    if (option === value) {
      return true;
    }
  }

  return false;
}
