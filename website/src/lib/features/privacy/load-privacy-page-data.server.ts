import { measurementID } from '../analytics/analytics.config.ts';
import type { PageLoadData } from '../content/content.types.ts';
import { loadPageData } from '../content/page.controller.server.ts';
import { createPrivacyPageData } from './create-privacy-page-data.model.ts';
import { privacyContactURL } from './privacy-contact-url.model.ts';
import { privacyPageRoute } from './privacy-page-route.model.ts';
import { privacyPolicyContent } from './privacy-policy-content.model.ts';

export async function loadPrivacyPageData(
  locale: string,
  interfaceName: 'minecraft' | 'terminal',
): Promise<PageLoadData> {
  const route = privacyPageRoute(locale, interfaceName);

  const base = await loadPageData(route);

  if (!base) {
    throw new Error(`Missing privacy page locale: ${locale}`);
  }

  const contactURL = privacyContactURL(base.quickLinks);

  const analyticsEnabled = Boolean(measurementID);

  const policy = privacyPolicyContent(locale, contactURL, analyticsEnabled);

  return createPrivacyPageData({
    base,
    locale,
    interfaceName,
    privacyPolicy: policy,
  });
}
