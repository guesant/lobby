import type { PageLoadData } from '../content/content.types.ts';
import { hasSearchFilters } from './has-search-filters.model.ts';
import type { SearchState } from './search.types.ts';
import { searchPhaseLabel } from './search-phase-label.viewmodel.ts';

export function searchStatus(
  state: SearchState,
  count: number,
  labels: PageLoadData['editorialUI'],
): string {
  const phaseLabel = searchPhaseLabel(state, labels);

  if (phaseLabel !== undefined) {
    return phaseLabel;
  }

  if (!state.query.trim()) {
    return labels['search_start'] ?? '';
  }

  if (count > 0) {
    return String(count);
  }

  if (hasSearchFilters(state.filters)) {
    return labels['search_filtered_empty'] ?? '';
  }

  return labels['search_empty'] ?? '';
}
