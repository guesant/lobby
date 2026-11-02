import { normalizeSearchText } from './normalize-search-text.model.ts';
import type { SearchItem } from './search.types.ts';
import { searchItemMatches } from './search-item-matches.model.ts';

type SearchableItem = Pick<
  SearchItem,
  'title' | 'summary' | 'tags' | 'metadata'
>;

export function searchItems<T extends SearchableItem>(
  index: T[],
  query: string,
): T[] {
  const trimmedQuery = query.trim();

  const normalized = normalizeSearchText(trimmedQuery);

  const terms = normalized.split(/\s+/)
    .filter(Boolean);

  if (!terms.length) {
    return [];
  }

  const matches: T[] = [];

  for (const item of index) {
    if (searchItemMatches(item, terms)) {
      matches.push(item);
    }
  }

  return matches;
}
