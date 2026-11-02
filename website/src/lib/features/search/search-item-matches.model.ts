import { normalizeSearchText } from './normalize-search-text.model.ts';
import type { SearchItem } from './search.types.ts';

type SearchableItem = Pick<
  SearchItem,
  'title' | 'summary' | 'tags' | 'metadata'
>;

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
