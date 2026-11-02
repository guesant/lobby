import type { PageLoadData } from '../content/content.types.ts';
import { filterSearchItems, searchItems } from './search.model.ts';
import { searchFilterChoices } from './search-filter-choices.viewmodel.ts';
import { searchResultGroups } from './search-result-groups.viewmodel.ts';
import { searchStatus } from './search-status.viewmodel.ts';
import type { SearchViewModel } from './search-viewmodel.types.ts';
import { page as currentRoute } from '$app/state';

export function updateSearchViewModel(
  model: SearchViewModel,
  origin: string,
): void {
  const page = currentRoute.data as PageLoadData;

  const matches = searchItems(model.state.index, model.state.query);

  const results = filterSearchItems(matches, model.state.filters);

  model.labels = page.editorialUI;
  model.filters = searchFilterChoices(model.state.index, page);
  model.groups = searchResultGroups(results, page, origin);
  model.status = searchStatus(model.state, results.length, page.editorialUI);
}
