import type { SiteData } from '../content/content.types.ts';
import type { CatalogPage } from './ai-catalog.types.ts';
import { localizedCatalogPages } from './localized-catalog-pages.server.ts';

export function pageEntries(data: SiteData): CatalogPage[] {
  const entries: CatalogPage[] = [];

  for (const language of data.links.language_options) {
    const pages = localizedCatalogPages(data, language.id);

    entries.push(...pages);
  }

  return entries;
}
