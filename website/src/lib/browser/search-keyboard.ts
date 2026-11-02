import { nextSearchResult } from '../features/search/search.model.ts';

type SearchElements = {
  dialog: HTMLDialogElement | undefined;
  input: HTMLInputElement | undefined;
};

function resultLinks(
  dialog: HTMLDialogElement | undefined,
): HTMLAnchorElement[] {
  if (!dialog) {
    return [];
  }

  return [
    ...dialog.querySelectorAll<HTMLAnchorElement>('#search-results a'),
  ];
}

export function searchKeydown(
  event: KeyboardEvent,
  elements: SearchElements,
): void {
  if (event.target instanceof HTMLSelectElement) {
    return;
  }

  const links = resultLinks(elements.dialog);

  if (event.key === 'Enter' && event.target === elements.input) {
    links[0]?.click();

    return;
  }

  if (!isResultNavigation(event.key, links.length)) {
    return;
  }

  const current = links.findIndex((link): boolean => {
    return link === document.activeElement;
  });

  const next = nextSearchResult(current, event.key, links.length);

  event.preventDefault();
  links[next]?.focus();
}

function isResultNavigation(
  key: string,
  count: number,
): key is 'ArrowDown' | 'ArrowUp' {
  return count > 0 && (key === 'ArrowDown' || key === 'ArrowUp');
}
