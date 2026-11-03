import type { PageLoadData } from '../content/content.types.ts';
import type { PrivacyPageDataInput } from './create-privacy-page-data.types.ts';
import { privacyLanguageRoutes } from './privacy-language-routes.model.ts';
import { privacyPageURL } from './privacy-page-url.model.ts';

export function createPrivacyPageData(
  input: PrivacyPageDataInput,
): PageLoadData {
  const base = input.base;

  const locale = input.locale;

  const interfaceName = input.interfaceName;

  const privacyPolicy = input.privacyPolicy;

  const standardURL = privacyPageURL(locale, 'minecraft');

  const terminalURL = privacyPageURL(locale, 'terminal');

  const url = privacyPageURL(locale, interfaceName);

  const languageRoutes = privacyLanguageRoutes(base.languageRoutes);

  return {
    ...base,
    page: {
      ...base.page,
      id: 'privacy',
      type: 'privacy-page',
      title: privacyPolicy.title,
      description: privacyPolicy.description,
      url,
      standard_url: standardURL,
      terminal_url: terminalURL,
      fallback: false,
    },
    links: [],
    editorial: [],
    languageRoutes,
    standardPageURL: standardURL,
    terminalPageURL: terminalURL,
    privacyURL: url,
    privacyPolicy,
  };
}
