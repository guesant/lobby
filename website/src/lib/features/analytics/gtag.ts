import type { AnalyticsTagWindow } from './analytics.types.ts';

export function gtag(...arguments_: unknown[]): void {
  const browser = window as AnalyticsTagWindow;

  if (!browser.dataLayer) {
    return;
  }

  browser.dataLayer.push(arguments_);
}
