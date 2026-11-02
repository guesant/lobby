import type { SearchFilters, SearchItem } from './search.types.ts';

export function filterSearchItem(
  item: SearchItem,
  filters: SearchFilters,
): boolean {
  return (
    (!filters.source || item.source === filters.source) &&
    (!filters.type || item.type === filters.type) &&
    (!filters.language || item.language === filters.language)
  );
}
