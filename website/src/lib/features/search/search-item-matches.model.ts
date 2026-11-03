import { normalizeSearchText } from './normalize-search-text.model.ts';
import type { SearchableItem } from './search-item-matches.types.ts';

export function searchItemMatches(
  item: SearchableItem,
  terms: string[],
): boolean {
  const metadata: string[] = [];

  for (const value of Object.values(item.metadata ?? {})) {
    const text = String(value);

    metadata.push(text);
  }

  const searchText = [
    item.title,
    item.summary,
    ...item.tags,
    ...metadata,
  ].join(' ');

  const haystack = normalizeSearchText(searchText);

  for (const term of terms) {
    if (!haystack.includes(term)) {
      return false;
    }
  }

  return true;
}
