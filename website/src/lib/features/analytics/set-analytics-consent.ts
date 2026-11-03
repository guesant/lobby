import type { ConsentContext } from './analytics-consent.types.ts';

const consentStorageKey = 'guesant-lobby-analytics-consent-v1';

export function setAnalyticsConsent(
  context: ConsentContext,
  status: 'granted' | 'denied',
): void {
  context.controls.analyticsConsent = status;
  context.controls.analyticsConsentLoaded = true;
  context.controls.dialog = 'none';

  const record = {
    version: 1,
    status,
    updatedAt: Date.now(),
  };

  const serialized = JSON.stringify(record);

  try {
    context.storage()
      .setItem(consentStorageKey, serialized);
  } catch {
    return;
  }
}
