import type { SiteData } from '../content/content.types.ts';
import { absoluteURL } from './absolute-url.server.ts';
import type { CatalogPage } from './ai-catalog.types.ts';
import { availableCatalogPages } from './available-catalog-pages.server.ts';

export function localizedCatalogPages(
  data: SiteData,
  locale: string,
): CatalogPage[] {
  const pages = availableCatalogPages(data, locale);

  const catalog: CatalogPage[] = [];

  for (const page of pages) {
    const urls = {
      voxel: absoluteURL(page.url),
    };

    const entry = {
      id: page.id,
      title: page.title,
      summary: page.description,
      type: page.type,
      language: locale,
      urls,
    };

    catalog.push(entry);
  }

  return catalog;
}
