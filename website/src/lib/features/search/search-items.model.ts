import { normalizeSearchText } from './normalize-search-text.model.ts';
import { searchItemMatches } from './search-item-matches.model.ts';
import type { SearchableItem } from './search-items.types.ts';

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
