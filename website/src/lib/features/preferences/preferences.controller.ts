import { browserPreferenceStorage } from '../../browser/preference-storage.ts';
import type { PreferenceController } from './preference-controller.types.ts';
import type { Preferences, StorageAccess } from './preferences.types.ts';
import { restorePreferences } from './restore-preferences.ts';
import { setPreference } from './set-preference.ts';

export function createPreferenceController(
  controls: Preferences,
  access: StorageAccess = browserPreferenceStorage,
): PreferenceController {
  const context = {
    controls,
    access,
  };

  return {
    set: setPreference.bind(null, context),
    restore: restorePreferences.bind(null, context),
  };
}
