import type { SiteData } from '../content/content.types.ts';
import { pagesFor } from '../navigation/catalog.model.ts';

export function availableCatalogPages(
  data: SiteData,
  locale: string,
): ReturnType<typeof pagesFor> {
  const available = [];

  for (const page of pagesFor(data, locale)) {
    if (!page.fallback) {
      available.push(page);
    }
  }

  return available;
}
