import type { CatalogCandidate, CatalogEntry } from './ai-catalog.types.ts';
import { absoluteURL } from './catalog-context.server.ts';
import { catalogInterfaceURLs } from './catalog-interface-urls.server.ts';
import { catalogRecord } from './catalog-record.server.ts';

export function catalogEntry(candidate: CatalogCandidate): CatalogEntry {
  const item = catalogRecord(candidate);

  const entry: CatalogEntry = {
    id: item.id,
    title: item.title,
    summary: item.summary,
    type: item.type,
    source: item.source,
    language: item.language,
    tags: [
      ...item.tags,
    ],
    url: absoluteURL(item.url),
  };

  if (item.metadata && Object.keys(item.metadata).length > 0) {
    entry.metadata = {
      ...item.metadata,
    };
  }

  if (item.details_url) {
    entry.details_url = absoluteURL(item.details_url);
  }

  if (item.details_label) {
    entry.details_label = item.details_label;
  }

  const urls = catalogInterfaceURLs(candidate, item);

  if (Object.keys(urls).length > 0) {
    entry.interface_urls = urls;
  }

  return entry;
}
