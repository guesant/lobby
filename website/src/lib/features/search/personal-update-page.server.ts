import type { PageRecord, SiteData } from '../content/content.types.ts';
import { pagesFor } from '../navigation/catalog.model.ts';

export function personalUpdatePage(
  data: SiteData,
  locale: string,
): PageRecord | undefined {
  for (const page of pagesFor(data, locale)) {
    if (page.id === 'now') {
      return page;
    }
  }

  return undefined;
}
