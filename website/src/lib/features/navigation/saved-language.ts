import type { LanguageNavigationState } from './language-controller.types.ts';

export function savedLanguage(state: LanguageNavigationState): string | null {
  try {
    return state.dependencies.storage()
      .getItem('guesant-links-language');
  } catch {
    return null;
  }
}
