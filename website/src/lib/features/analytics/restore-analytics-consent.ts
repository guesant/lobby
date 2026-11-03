import type { ConsentContext } from './analytics-consent.types.ts';
import { parseAnalyticsConsent } from './parse-analytics-consent.ts';
import { readStoredConsent } from './read-stored-consent.ts';

export function restoreAnalyticsConsent(context: ConsentContext): void {
  const saved = readStoredConsent(context.storage);

  const status = parseAnalyticsConsent(saved);

  context.controls.analyticsConsent = status;
  context.controls.analyticsConsentLoaded = true;
}
