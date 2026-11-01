import { error } from '@sveltejs/kit';
import { pagesFor } from './site-data.server.ts';
import type { PageRecord, SiteData } from './site-data.ts';

type PageContext = {
  locale: string;
  interfaceName: 'minecraft' | 'terminal';
  page: PageRecord;
  pages: PageRecord[];
  standardPages: PageRecord[];
  terminalPages: PageRecord[];
};

export function resolvePageContext(data: SiteData, path: string): PageContext {
  const parts = path.split('/')
    .filter(Boolean);

  const locale = parts[0];

  if (
    !locale ||
    !data.links.language_options.some((language): boolean => {
      return language.id === locale;
    })
  ) {
    error(404, 'Page not found');
  }

  let interfaceName: PageContext['interfaceName'] = 'minecraft';

  if (parts[1] === 'terminal') {
    interfaceName = 'terminal';
  }

  const pages = pagesFor(data, locale, interfaceName);

  const pathname = `/${parts.join('/')}`.replace(/\/+$/, '') || '/';

  const page = pages.find((entry): boolean => {
    return entry.url.replace(/\/+$/, '') === pathname;
  });

  if (!page || page.fallback) {
    error(404, 'Page not found');
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
