import { quickLinks } from '../listings/quick-links.model.ts';
import type { PageContext } from '../navigation/page.model.ts';
import {
  interfaceDestinations,
  languageRoutes,
} from '../navigation/translations.model.ts';
import { clientConfiguration } from './client-configuration.model.ts';
import type { PageLoadData } from './content.types.ts';
import type { SiteData } from './content.types.ts';
import { homeSectionContents } from './home-section-contents.model.ts';
import { pageListings } from './page-listings.model.ts';
import { summarizePage } from './summarize-page.model.ts';
import { summarizePages } from './summarize-pages.model.ts';

type PageContent = Omit<
  PageLoadData,
  'isLanguageEntry' | 'federationStatus' | 'build'
>;

export function pageContent(data: SiteData, context: PageContext): PageContent {
  const locale = context.locale;

  const localized = data.links.locales[locale];

  const editorialUI = data.editorial.ui[locale];

  const now = data.links.now[locale] ?? data.links.now['en'];

  if (!localized || !editorialUI || !now) {
    throw new Error(`Missing page content: ${locale}`);
  }

  const listings = pageListings(data, context, locale);

  const pages = summarizePages(context.pages);

  return {
    config: clientConfiguration(data),
    nowActivity: data.editorial.now[locale] ?? {},
    editorialUI,
    localized,
    credits: data.credits,
    locale,
    interfaceName: context.interfaceName,
    page: summarizePage(context.page),
    pages,
    languageRoutes: languageRoutes(data, context.page.id),
    ...interfaceDestinations(context),
    homeSections: homeSectionContents(data, context),
    quickLinks: quickLinks(data, locale),
    links: listings.links,
    editorial: listings.editorial,
    now,
  };
}
