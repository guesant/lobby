import type { PageLoadData } from '../content/content.types.ts';
import type { SearchState } from './search.types.ts';

export function searchPhaseLabel(
  state: SearchState,
  labels: PageLoadData['editorialUI'],
): string | undefined {
  if (state.phase === 'loading') {
    return labels['search_loading'] ?? '';
  }

  if (state.phase === 'error') {
    return labels['search_unavailable'] ?? '';
  }

  return undefined;
}
