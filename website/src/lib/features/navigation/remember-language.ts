import type { LanguageNavigationState } from './language-controller.types.ts';

export function rememberLanguage(
  state: LanguageNavigationState,
  id: string,
): boolean {
  try {
    const storage = state.dependencies.storage();

    storage.setItem('guesant-links-language', id);

    return storage.getItem('guesant-links-language') === id;
  } catch {
    return false;
  }
}
