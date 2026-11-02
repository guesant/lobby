import type { LanguageNavigationState } from './language-controller.types.ts';

export function beforeLanguageNavigation(
  state: LanguageNavigationState,
  url: URL | null,
): void {
  if (state.pending && url?.href !== state.destination) {
    state.generation += 1;
    state.pending = false;
    state.destination = null;
  }
}
