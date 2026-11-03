import type { SiteData } from '../content/content.types.ts';
import type { InterfaceName } from '../metadata/resources.types.ts';
import { pagesFor } from '../navigation/catalog.model.ts';
import { indexActivity } from './index-activity.server.ts';
import { indexPage } from './index-page.server.ts';
import { indexPersonalUpdate } from './index-personal-update.server.ts';
import type { SearchItem } from './search.types.ts';
import type { SearchContext } from './search-context.types.ts';

export function searchEntries(
  data: SiteData,
  locale: string,
  interfaceName: InterfaceName,
): SearchItem[] {
  const ui = data.editorial.ui[locale];

  if (!ui) {
    throw new Error(`Missing search labels: ${locale}`);
  }

  const context: SearchContext = {
    data,
    locale,
    interfaceName,
    ui,
  };

  const output: SearchItem[] = [];

  for (const page of pagesFor(data, locale, interfaceName)) {
    if (!page.fallback) {
      const entries = indexPage(page, context);

      output.push(...entries);
    }
  }

  const personalEntries = indexPersonalUpdate(context);

  const activityEntries = indexActivity(context);

  output.push(...personalEntries);
  output.push(...activityEntries);

  return output;
}
