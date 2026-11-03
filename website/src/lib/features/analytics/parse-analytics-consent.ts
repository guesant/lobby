import type { AnalyticsConsent } from '../preferences/preferences.types.ts';
import { validConsentRecord } from './valid-consent-record.model.ts';

const consentLifetime = 1000 * 60 * 60 * 24 * 183;

export function parseAnalyticsConsent(saved: string | null): AnalyticsConsent {
  if (saved === null) {
    return 'unknown';
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(saved);
  } catch {
    return 'unknown';
  }

  const record = validConsentRecord(parsed);

  const now = Date.now();

  if (
    !record ||
    record.updatedAt > now ||
    now - record.updatedAt > consentLifetime
  ) {
    return 'unknown';
  }

  return record.status;
}
