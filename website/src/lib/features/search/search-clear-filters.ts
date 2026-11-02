import type { SearchControllerState } from './search-controller.types.ts';

export function searchClearFilters(context: SearchControllerState): void {
  context.state.filters = {
    source: '',
    type: '',
    language: '',
  };
}
