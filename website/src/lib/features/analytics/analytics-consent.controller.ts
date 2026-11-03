import { browserPreferenceStorage } from '../../browser/preference-storage.ts';
import type {
  InterfaceState,
  StorageAccess,
} from '../preferences/preferences.types.ts';
import type {
  ConsentContext,
  ConsentController,
} from './analytics-consent.types.ts';
import { restoreAnalyticsConsent } from './restore-analytics-consent.ts';
import { setAnalyticsConsent } from './set-analytics-consent.ts';

export function createAnalyticsConsentController(
  controls: InterfaceState,
  storage: StorageAccess = browserPreferenceStorage,
): ConsentController {
  const context: ConsentContext = {
    controls,
    storage,
  };

  return {
    restore: restoreAnalyticsConsent.bind(null, context),
    set: setAnalyticsConsent.bind(null, context),
  };
}
