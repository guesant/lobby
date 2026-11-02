import { resolveDestination } from '../content/content.model.ts';
import type { PageLoadData } from '../content/content.types.ts';
import { textOr } from '../content/text-or.model.ts';
import type { SearchItem } from './search.types.ts';
import { searchOptionLabel } from './search-option-label.viewmodel.ts';
import type { SearchResult } from './search-viewmodel.types.ts';

export function presentSearchResult(
  entry: SearchItem,
  page: PageLoadData,
  origin: string,
): SearchResult {
  const result: SearchResult = {
    id: entry.id,
    title: entry.title,
    action: resolveDestination(
      page.config.site,
      {
        url: entry.url,
      },
      origin,
    ),
    origin: `${page.editorialUI['source'] ?? ''}: ${searchOptionLabel('source', entry.source, page)} · ${page.editorialUI['language'] ?? ''}: ${searchOptionLabel('language', entry.language, page)}`,
    detailsTitle: textOr(entry.details_label, entry.title),
  };

  if (entry.details_url) {
    result.details = resolveDestination(
      page.config.site,
      {
        url: entry.details_url,
      },
      origin,
    );
  }

  return result;
}
