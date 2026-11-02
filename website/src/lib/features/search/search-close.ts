import { searchClearFilters } from './search-clear-filters.ts';
import type { SearchControllerState } from './search-controller.types.ts';

export function searchClose(context: SearchControllerState): void {
  context.dependencies.closeDialog();
  searchClearFilters(context);
  context.state.query = '';
}
