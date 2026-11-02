import { browserPreferenceStorage } from '../../browser/preference-storage.ts';
import type { Preferences, StorageAccess } from './preferences.model.ts';
import { assignPreference, preferenceKeys } from './preferences.model.ts';

export type PreferenceController = {
  set: (key: keyof Preferences, value: string) => void;
  restore: () => void;
};

export function createPreferenceController(
  controls: Preferences,
  access: StorageAccess = browserPreferenceStorage,
): PreferenceController {
  function set(key: keyof Preferences, value: string): void {
    if (!assignPreference(controls, key, value)) {
      return;
    }

    try {
      access()
        .setItem(`guesant-links-${key}`, value);
    } catch {
      return;
    }
  }

  function restore(): void {
    for (const key of preferenceKeys) {
      try {
        const saved = access()
          .getItem(`guesant-links-${key}`);

        if (saved !== null) {
          assignPreference(controls, key, saved);
        }
      } catch {
        continue;
      }
    }
  }

  return {
    set,
    restore,
  };
}
