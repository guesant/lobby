import type { SearchFilters } from './search.types.ts';

export function hasSearchFilters(filters: SearchFilters): boolean {
  for (const value of Object.values(filters)) {
    if (value) {
      return true;
    }
  }

  return false;
}
