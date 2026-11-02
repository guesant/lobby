import type { SiteData } from '../content/content.types.ts';
import { pagesFor } from '../navigation/catalog.model.ts';

export function catalogPageIDs(data: SiteData, locale: string): Set<string> {
  const ids = new Set<string>();

  for (const page of pagesFor(data, locale)) {
    if (!page.fallback) {
      ids.add(`page-${page.id}`);
    }
  }

  return ids;
}
