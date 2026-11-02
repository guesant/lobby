import { initialSearchState } from './search.model.ts';
import type { SearchViewModel } from './search-viewmodel.types.ts';
import { updateSearchViewModel } from './update-search-viewmodel.svelte.ts';

export function createSearchViewModel(origin: string): SearchViewModel {
  const initialState = initialSearchState();

  const model = $state<SearchViewModel>({
    state: initialState,
    labels: {},
    filters: [],
    groups: [],
    status: '',
  });

  updateSearchViewModel(model, origin);

  const update = updateSearchViewModel.bind(null, model, origin);

  $effect(update);

  return model;
}
