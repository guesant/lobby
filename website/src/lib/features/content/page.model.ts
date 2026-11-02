import { sectionLinks } from '../listings/links.model.ts';
import { quickLinks } from '../listings/quick-links.model.ts';
import type { PageContext } from '../navigation/page.model.ts';
import {
  interfaceDestinations,
  languageRoutes,
} from '../navigation/translations.model.ts';
import type { PageLoadData, PageRecord, SiteData } from './content.types.ts';
import { editorialItems } from './editorial.model.ts';

function pageSummary(entry: PageRecord): PageRecord {
  const summary = {
    ...entry,
  };

  delete summary.section;
  delete summary.links;

  return summary;
}

function homeSection(
  data: SiteData,
  entry: PageRecord,
  locale: string,
): PageLoadData['homeSections'][number] {
  if (!entry.section) {
    throw new Error(`Missing section: ${entry.id}`);
  }

  return {
    page: pageSummary(entry),
    links: sectionLinks(data, entry.section, locale),
    editorial: editorialItems(data, entry.id, locale),
  };
}

function homeSections(
  data: SiteData,
  context: PageContext,
): PageLoadData['homeSections'] {
  if (context.page.id !== 'home') {
    return [];
  }

  return context.pages
    .filter((entry): boolean => {
      return entry.type === 'links-page';
    })
    .map((entry): PageLoadData['homeSections'][number] => {
      return homeSection(data, entry, context.locale);
    });
}

function clientConfiguration(data: SiteData): PageLoadData['config'] {
  return {
    profile: data.links.profile,
    theme: {
      appearance: data.links.theme.appearance,
      animations_enabled: data.links.theme.animations_enabled,
    },
    navigation: {
      home: data.links.navigation.home,
    },
    site: data.links.site,
    language_preference: data.links.language_preference,
  };
}

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

  let links: PageLoadData['links'] = [];

  let editorial: PageLoadData['editorial'] = [];

  if (context.page.section) {
    links = sectionLinks(data, context.page.section, locale);
    editorial = editorialItems(data, context.page.id, locale);
  }

  return {
    config: clientConfiguration(data),
    nowActivity: data.editorial.now[locale] ?? {},
    editorialUI,
    localized,
    credits: data.credits,
    locale,
    interfaceName: context.interfaceName,
    page: pageSummary(context.page),
    pages: context.pages.map(pageSummary),
    languageRoutes: languageRoutes(data, context.page.id),
    ...interfaceDestinations(context),
    homeSections: homeSections(data, context),
    quickLinks: quickLinks(data, locale),
    links,
    editorial,
    now,
  };
}
