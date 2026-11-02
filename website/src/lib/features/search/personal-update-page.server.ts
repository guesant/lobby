import type { PageRecord, SiteData } from '../content/content.types.ts';
import type { InterfaceName } from '../metadata/resources.server.ts';
import { pagesFor } from '../navigation/catalog.model.ts';

export function personalUpdatePage(
  data: SiteData,
  locale: string,
  interfaceName: InterfaceName,
): PageRecord | undefined {
  for (const page of pagesFor(data, locale, interfaceName)) {
    if (page.id === 'now') {
      return page;
    }
  }

  return undefined;
}
