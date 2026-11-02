import type { SearchState } from './search.model.ts';
import { searchClearFilters } from './search-clear-filters.ts';
import { searchClose } from './search-close.ts';
import type {
  SearchController,
  SearchControllerState,
  SearchDependencies,
} from './search-controller.types.ts';
import { searchDestroy } from './search-destroy.ts';
import { searchLoad } from './search-load.ts';
import { searchPrepare } from './search-prepare.ts';

export type { SearchController } from './search-controller.types.ts';

export function createSearchController(
  state: SearchState,
  dependencies: SearchDependencies,
): SearchController {
  const context: SearchControllerState = {
    pending: undefined,
    loadedURL: '',
    destroyed: false,
    state,
    dependencies,
  };

  return {
    load: searchLoad.bind(null, context),
    prepare: searchPrepare.bind(null, context),
    clearFilters: searchClearFilters.bind(null, context),
    close: searchClose.bind(null, context),
    destroy: searchDestroy.bind(null, context),
  };
}
