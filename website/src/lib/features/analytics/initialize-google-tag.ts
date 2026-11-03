import type { AnalyticsTagWindow } from './analytics.types.ts';
import { appendGoogleTag } from './append-google-tag.ts';
import { configureGoogleTag } from './configure-google-tag.ts';
import { gtag } from './gtag.ts';

export function initializeGoogleTag(measurementID: string): void {
  if (!measurementID || typeof window === 'undefined') {
    return;
  }

  const browser = window as AnalyticsTagWindow;

  if (browser.lobbyAnalyticsID === measurementID) {
    return;
  }

  browser.lobbyAnalyticsID = measurementID;
  browser.dataLayer = browser.dataLayer ?? [];
  browser.gtag = gtag;
  configureGoogleTag(browser, measurementID);
  appendGoogleTag(measurementID);
}
