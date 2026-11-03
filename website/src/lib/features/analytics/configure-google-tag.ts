import type { AnalyticsTagWindow } from './analytics.types.ts';

export function configureGoogleTag(
  browser: AnalyticsTagWindow,
  measurementID: string,
): void {
  browser.gtag?.('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  });
  browser.gtag?.('consent', 'update', {
    analytics_storage: 'granted',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  });
  browser.gtag?.('js', new Date());
  browser.gtag?.('config', measurementID, {
    send_page_view: false,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });
}
