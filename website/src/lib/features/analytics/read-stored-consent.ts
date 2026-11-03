import type { PreferenceStorage } from '../preferences/preferences.types.ts';

const consentStorageKey = 'guesant-lobby-analytics-consent-v1';

export function readStoredConsent(
  storage: () => PreferenceStorage,
): string | null {
  try {
    const access = storage();

    return access.getItem(consentStorageKey);
  } catch {
    return null;
  }
}
