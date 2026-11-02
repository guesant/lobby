import type { PreferenceStorage } from '../features/preferences/preferences.model.ts';

export function browserPreferenceStorage(): PreferenceStorage {
  return localStorage;
}
