import type { SearchState } from './search.types.ts';

export function initialSearchState(): SearchState {
  return {
    phase: 'idle',
    index: [],
    query: '',
    filters: {
      source: '',
      type: '',
      language: '',
    },
  };
}
