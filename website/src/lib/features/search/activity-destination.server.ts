import type { PageRecord, SiteData } from '../content/content.types.ts';
import type { InterfaceName } from '../metadata/resources.types.ts';
import { pagesFor } from '../navigation/catalog.model.ts';

export function activityDestination(
  data: SiteData,
  locale: string,
  interfaceName: InterfaceName,
): PageRecord | undefined {
  let home: PageRecord | undefined;

  let now: PageRecord | undefined;

  for (const page of pagesFor(data, locale, interfaceName)) {
    if (page.id === 'home') {
      home = page;
    }

    if (page.id === 'now') {
      now = page;
    }
  }

  if (data.editorial.now[locale]) {
    return now;
  }

  return home;
}
