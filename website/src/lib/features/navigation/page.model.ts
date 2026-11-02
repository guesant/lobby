import type { PageRecord, SiteData } from '../content/content.types.ts';
import { textOr } from '../content/text.model.ts';
import { pagesFor } from './catalog.model.ts';

export type PageContext = {
  locale: string;
  interfaceName: 'minecraft' | 'terminal';
  page: PageRecord;
  pages: PageRecord[];
  standardPages: PageRecord[];
  terminalPages: PageRecord[];
};

export function resolvePageContext(
  data: SiteData,
  path: string,
): PageContext | undefined {
  const parts = path.split('/')
    .filter(Boolean);

  const locale = parts[0];

  if (
    !locale ||
    !data.links.language_options.some((language): boolean => {
      return language.id === locale;
    })
  ) {
    return undefined;
  }

  let interfaceName: PageContext['interfaceName'] = 'minecraft';

  if (parts[1] === 'terminal') {
    interfaceName = 'terminal';
  }

  const pages = pagesFor(data, locale, interfaceName);

  const pathname = textOr(`/${parts.join('/')}`.replace(/\/+$/, ''), '/');

  const page = pages.find((entry): boolean => {
    return entry.url.replace(/\/+$/, '') === pathname;
  });

  if (!page || page.fallback) {
    return undefined;
  }

  return {
    locale,
    interfaceName,
    page,
    pages,
    standardPages: pagesFor(data, locale, 'minecraft'),
    terminalPages: pagesFor(data, locale, 'terminal'),
  };
}
