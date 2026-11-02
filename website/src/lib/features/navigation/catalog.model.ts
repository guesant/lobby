import type { PageRecord, SiteData } from '../content/content.types.ts';
import { optionalProperty } from '../content/object-fields.model.ts';
import * as configuration from './routes.model.ts';

type ConfiguredPage = ReturnType<typeof configuration.pagesFor>[number];

type RouteContext = {
  localePath: string;
  englishPath: string;
  interfaceName: string;
};

function pageURLs(
  page: ConfiguredPage,
  context: RouteContext,
): {
  standard: string;
  terminal: string;
} {
  if (page.id === 'now' && page.fallback) {
    return {
      standard: `${context.englishPath}now/`,
      terminal: `${context.englishPath}terminal/now/`,
    };
  }

  let terminal = `${context.localePath}terminal/`;

  if (page.id !== 'home' && !page.fallback) {
    terminal = `${context.localePath}terminal/${page.id}/`;
  }

  return {
    standard: page.url,
    terminal,
  };
}

function presentedPage(
  data: SiteData,
  page: ConfiguredPage,
  context: RouteContext,
): PageRecord {
  const urls = pageURLs(page, context);

  const section = data.links.sections.find((candidate): boolean => {
    return candidate.id === page.id;
  });

  let url = urls.standard;

  if (context.interfaceName === 'terminal') {
    url = urls.terminal;
  }

  return {
    ...page,
    fallback: page.fallback ?? false,
    description: page.description ?? '',
    standard_url: urls.standard,
    terminal_url: urls.terminal,
    url,
    ...optionalProperty('section', section),
  };
}

export function pagesFor(
  data: SiteData,
  locale: string,
  interfaceName = 'minecraft',
): PageRecord[] {
  const language = data.links.language_options.find((item): boolean => {
    return item.id === locale;
  });

  const english = data.links.language_options.find((item): boolean => {
    return item.id === 'en';
  });

  if (!language || !english) {
    throw new Error(`Unknown language: ${locale}`);
  }

  const context: RouteContext = {
    localePath: language.path,
    englishPath: english.path,
    interfaceName,
  };

  return configuration.pagesFor(data.links, locale)
    .map((page): PageRecord => {
      return presentedPage(data, page, context);
    });
}

function localizedEntries(data: SiteData, locale: string): string[] {
  return [
    ...pagesFor(data, locale, 'minecraft'),
    ...pagesFor(data, locale, 'terminal'),
  ]
    .filter((page): boolean => {
      return !page.fallback;
    })
    .map((page): string => {
      return page.url.slice(1, -1);
    });
}

export function routeEntries(data: SiteData): string[] {
  return data.links.language_options.flatMap((language): string[] => {
    return localizedEntries(data, language.id);
  });
}
