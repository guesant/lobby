import type { PageLoadData } from '../content/content.types.ts';
import { siteOrigin } from '../navigation/origin.model.ts';
import { alternateRoutes } from './alternate-routes.model.ts';
import { defaultLanguageURL } from './default-language-url.model.ts';
import type { PageMetadata } from './metadata.types.ts';
import { nonCurrentAlternates } from './non-current-alternates.model.ts';
import { pageDescription } from './page-description.model.ts';
import { pageTitle } from './page-title.model.ts';
import { structuredData } from './structured-data.model.ts';

export type { PageMetadata } from './metadata.types.ts';

export function pageMetadata(page: PageLoadData): PageMetadata {
  const alternates = alternateRoutes(page);

  let robots: PageMetadata['robots'] = 'index, follow';

  if (page.isLanguageEntry) {
    robots = 'noindex, follow';
  }

  const metadata = {
    title: pageTitle(page),
    description: pageDescription(page),
    canonical: `${siteOrigin}${page.page.url}`,
    ogImageURL: `${siteOrigin}/images/og-image.png`,
    robots,
    alternates,
    ogAlternates: nonCurrentAlternates(alternates, page.locale),
    defaultLanguageURL: defaultLanguageURL(page, alternates),
  };

  return {
    ...metadata,
    structuredData: structuredData(page, metadata),
  };
}
