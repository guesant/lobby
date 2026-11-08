import type { SiteData } from '../content/content.types.ts';
import { pagesFor } from './catalog.model.ts';
import { knownLocale } from './known-locale.model.ts';
import type { PageContext } from './page.types.ts';
import { pageForPath } from './page-for-path.model.ts';

export function resolvePageContext(
  data: SiteData,
  path: string,
): PageContext | undefined {
  const parts = path.split('/')
    .filter(Boolean);

  const locale = parts[0];

  if (!locale) {
    return undefined;
  }

  if (!knownLocale(data, locale)) {
    return undefined;
  }

  const pages = pagesFor(data, locale);

  const pathname = `/${parts.join('/')}`.replace(/\/+$/, '') || '/';

  const page = pageForPath(pages, pathname);

  if (!page || page.fallback) {
    return undefined;
  }

  return {
    locale,
    interfaceName: 'voxel',
    page,
    pages,
  };
}
