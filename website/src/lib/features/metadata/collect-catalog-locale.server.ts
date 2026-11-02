import type { SiteData } from '../content/content.types.ts';
import { searchEntries } from '../search/search-index.server.ts';
import type { CatalogCandidate } from './ai-catalog.types.ts';
import { appendCatalogCandidate } from './append-catalog-candidate.server.ts';
import { interfaceNames } from './catalog-context.server.ts';
import { catalogPageIDs } from './catalog-page-ids.server.ts';

export function collectCatalogLocale(
  data: SiteData,
  locale: string,
  candidates: Map<string, CatalogCandidate>,
): void {
  const pageIDs = catalogPageIDs(data, locale);

  for (const interfaceName of interfaceNames) {
    for (const item of searchEntries(data, locale, interfaceName)) {
      if (pageIDs.has(item.id)) {
        continue;
      }

      appendCatalogCandidate(candidates, item, {
        requestedLocale: locale,
        interfaceName,
      });
    }
  }
}
