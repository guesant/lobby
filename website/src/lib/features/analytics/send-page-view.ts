import type { AnalyticsTagWindow } from './analytics.types.ts';
import { initializeGoogleTag } from './initialize-google-tag.ts';

export function sendPageView(measurementID: string, path: string): void {
  if (!measurementID || typeof window === 'undefined') {
    return;
  }

  initializeGoogleTag(measurementID);

  const browser = window as AnalyticsTagWindow;

  if (!browser.gtag) {
    return;
  }

  const pageURL = new URL(path, window.location.origin);

  browser.gtag('event', 'page_view', {
    page_location: pageURL.href,
    page_title: document.title,
  });
}
