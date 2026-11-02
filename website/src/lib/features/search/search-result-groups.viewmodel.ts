import type { PageLoadData } from '../content/content.types.ts';
import { presentSearchResult } from './present-search-result.viewmodel.ts';
import type { SearchItem } from './search.types.ts';
import type { ResultGroup } from './search-viewmodel.types.ts';

export function searchResultGroups(
  results: SearchItem[],
  page: PageLoadData,
  origin: string,
): ResultGroup[] {
  const grouped = new Map<string, SearchItem[]>();

  for (const result of results) {
    const entries = grouped.get(result.group) ?? [];

    entries.push(result);
    grouped.set(result.group, entries);
  }

  const output: ResultGroup[] = [];

  for (const [
    title,
    entries,
  ] of grouped) {
    const presented: ResultGroup['entries'] = [];

    for (const entry of entries) {
      const result = presentSearchResult(entry, page, origin);

      presented.push(result);
    }

    output.push({
      title,
      entries: presented,
    });
  }

  return output;
}
