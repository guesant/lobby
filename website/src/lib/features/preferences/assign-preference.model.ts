import type { Preferences } from './preferences.types.ts';
import { validPreference } from './valid-preference.model.ts';

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters -- IMPORTANT: Key preserves the correlation between indexed preference values and their destination; a union produces an unassignable intersection.
export function assignPreference<Key extends keyof Preferences>(
  controls: Preferences,
  key: Key,
  value: string,
): boolean {
  if (!validPreference(key, value)) {
    return false;
  }

  controls[key] = value;

  return true;
}
