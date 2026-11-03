import type { AnalyticsTagWindow } from './analytics.types.ts';

export function updateGoogleConsent(status: 'granted' | 'denied'): void {
  if (typeof window === 'undefined') {
    return;
  }

  const browser = window as AnalyticsTagWindow;

  if (!browser.gtag) {
    return;
  }

  let analyticsStorage = 'denied';

  if (status === 'granted') {
    analyticsStorage = 'granted';
  }

  browser.gtag('consent', 'update', {
    analytics_storage: analyticsStorage,
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  });
}
