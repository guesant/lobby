import { filterSearchItem } from './filter-search-item.model.ts';
import type { SearchFilters, SearchItem } from './search.types.ts';

export function filterSearchItems(
  items: SearchItem[],
  filters: SearchFilters,
): SearchItem[] {
  const output: SearchItem[] = [];

  for (const item of items) {
    if (filterSearchItem(item, filters)) {
      output.push(item);
    }
  }

  return output;
}
