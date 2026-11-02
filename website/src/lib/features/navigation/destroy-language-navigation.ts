import type { LanguageNavigationState } from './language-controller.types.ts';

export function destroyLanguageNavigation(
  state: LanguageNavigationState,
): void {
  state.destroyed = true;
  state.generation += 1;
}
