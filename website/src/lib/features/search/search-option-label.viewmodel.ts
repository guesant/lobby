import type { PageLoadData } from '../content/content.types.ts';
import type { SearchFilters } from './search.types.ts';

export function searchOptionLabel(
  key: keyof SearchFilters,
  value: string,
  page: PageLoadData,
): string {
  if (key === 'source') {
    if (value === 'lobby') {
      return 'Lobby';
    }

    return page.editorialUI[`source_${value}`] ?? value;
  }

  if (key === 'language') {
    for (const route of page.languageRoutes) {
      if (route.id === value) {
        return route.label;
      }
    }

    return value;
  }

  return page.editorialUI[value] ?? value;
}
