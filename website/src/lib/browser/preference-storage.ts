import type { PreferenceStorage } from '../features/preferences/preferences.types.ts';

export function browserPreferenceStorage(): PreferenceStorage {
  return localStorage;
}
