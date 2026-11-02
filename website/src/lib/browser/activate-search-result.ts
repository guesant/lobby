export function activateSearchResult(
  event: KeyboardEvent,
  input: HTMLInputElement | null,
  links: HTMLAnchorElement[],
): boolean {
  if (event.key !== 'Enter' || event.target !== input) {
    return false;
  }

  links[0]?.click();

  return true;
}
