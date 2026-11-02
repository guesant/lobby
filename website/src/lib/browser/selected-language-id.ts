export function selectedLanguageID(event: Event): string | undefined {
  const select = event.target;

  if (
    !(select instanceof HTMLSelectElement) ||
    !select.matches('[data-language-switcher]')
  ) {
    return undefined;
  }

  return select.selectedOptions.item(0)?.dataset['language'];
}
