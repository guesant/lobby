import type { SiteData } from '../content/content.types.ts';
import { pagesFor } from '../navigation/catalog.model.ts';
import type { InterfaceName } from './resources.types.ts';

export function availableCatalogPages(
  data: SiteData,
  locale: string,
  interfaceName: InterfaceName,
): ReturnType<typeof pagesFor> {
  const available = [];

  for (const page of pagesFor(data, locale, interfaceName)) {
    if (!page.fallback) {
      available.push(page);
    }
  }

  return available;
}
