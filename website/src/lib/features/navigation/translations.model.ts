import type {
  PageLoadData,
  PageRecord,
  SiteData,
} from '../content/content.types.ts';
import { pagesFor } from './catalog.model.ts';
import type { PageContext } from './page.model.ts';

function pageDestination(pages: PageRecord[], pageID: string): string {
  const matching = pages.find((entry): boolean => {
    return entry.id === pageID && !entry.fallback;
  });

  return matching?.url ?? pages[0]?.url ?? '/';
}

export function languageRoutes(
  data: SiteData,
  pageID: string,
): PageLoadData['languageRoutes'] {
  return data.links.language_options.map(
    (option): PageLoadData['languageRoutes'][number] => {
      const standard = pagesFor(data, option.id, 'minecraft');

      const terminal = pagesFor(data, option.id, 'terminal');

      return {
        ...option,
        ogLocale: data.links.locales[option.id]?.ui['og_locale'] ?? '',
        available: standard.some((entry): boolean => {
          return entry.id === pageID && !entry.fallback;
        }),
        standardURL: pageDestination(standard, pageID),
        terminalURL: pageDestination(terminal, pageID),
      };
    },
  );
}

export function interfaceDestinations(
  context: PageContext,
): Pick<
  PageLoadData,
  'standardHomeURL' | 'standardPageURL' | 'terminalPageURL'
> {
  const home = context.standardPages.find((entry): boolean => {
    return entry.id === 'home';
  });

  if (!home || !context.standardPages.length || !context.terminalPages.length) {
    throw new Error('Missing localized interface destinations');
  }

  return {
    standardHomeURL: home.url,
    standardPageURL: pageDestination(context.standardPages, context.page.id),
    terminalPageURL: pageDestination(context.terminalPages, context.page.id),
  };
}
