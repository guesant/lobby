import { nextSearchResult } from '../features/search/search.model.ts';
import { activeSearchLink } from './active-search-link.model.ts';

export function focusSearchResult(
  event: KeyboardEvent,
  links: HTMLAnchorElement[],
): void {
  const current = activeSearchLink(links);

  const key = event.key;

  if (key !== 'ArrowDown' && key !== 'ArrowUp') {
    return;
  }

  const next = nextSearchResult(current, key, links.length);

  event.preventDefault();
  links[next]?.focus();
}
