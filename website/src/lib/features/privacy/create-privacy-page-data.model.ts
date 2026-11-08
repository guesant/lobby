import type { PageLoadData } from '../content/content.types.ts';
import type { PrivacyPageDataInput } from './create-privacy-page-data.types.ts';
import { privacyLanguageRoutes } from './privacy-language-routes.model.ts';
import { privacyPageURL } from './privacy-page-url.model.ts';

export function createPrivacyPageData(
  input: PrivacyPageDataInput,
): PageLoadData {
  const base = input.base;

  const locale = input.locale;

  const privacyPolicy = input.privacyPolicy;

  const url = privacyPageURL(locale);

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
      fallback: false,
    },
    links: [],
    editorial: [],
    languageRoutes,
    privacyURL: url,
    privacyPolicy,
  };
}
