import type { SiteData } from '../content/content.types.ts';
import type { CatalogPage } from './ai-catalog.types.ts';
import { catalogPageURLs } from './catalog-page-urls.server.ts';
import { localizedCatalogVariants } from './localized-catalog-variants.server.ts';

export function localizedCatalogPages(
  data: SiteData,
  locale: string,
): CatalogPage[] {
  const variants = localizedCatalogVariants(data, locale);

  const first = variants[0];

  if (!first) {
    throw new Error(`Missing page routes: ${locale}`);
  }

  const catalog: CatalogPage[] = [];

  for (const page of first.values()) {
    const urls = catalogPageURLs(page.id, variants);

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
