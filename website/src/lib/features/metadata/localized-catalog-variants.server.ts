import type { SiteData } from '../content/content.types.ts';
import type { pagesFor } from '../navigation/catalog.model.ts';
import { availableCatalogPages } from './available-catalog-pages.server.ts';
import { interfaceNames } from './catalog-context.server.ts';

export function localizedCatalogVariants(
  data: SiteData,
  locale: string,
): Map<string, ReturnType<typeof pagesFor>[number]>[] {
  const variants: Map<string, ReturnType<typeof pagesFor>[number]>[] = [];

  for (const interfaceName of interfaceNames) {
    const pages = availableCatalogPages(data, locale, interfaceName);

    const entries = new Map<string, ReturnType<typeof pagesFor>[number]>();

    for (const page of pages) {
      entries.set(page.id, page);
    }

    variants.push(entries);
  }

  return variants;
}
