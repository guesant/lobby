import { activateSearchResult } from './activate-search-result.ts';
import { focusSearchResult } from './focus-search-result.ts';
import { searchResultNavigation } from './search-result-navigation.model.ts';

export function searchKeydown(event: KeyboardEvent): void {
  if (event.target instanceof HTMLSelectElement) {
    return;
  }

  const dialog = event.currentTarget;

  if (!(dialog instanceof HTMLDialogElement)) {
    return;
  }

  const links = [
    ...dialog.querySelectorAll<HTMLAnchorElement>('#search-results a'),
  ];

  const input = dialog.querySelector<HTMLInputElement>('#search-query');

  if (activateSearchResult(event, input, links)) {
    return;
  }

  if (!searchResultNavigation(event.key, links.length)) {
    return;
  }

  focusSearchResult(event, links);
}
