import type { LanguageNavigationState } from './language-controller.types.ts';

export async function navigateLanguagePage(
  state: LanguageNavigationState,
  url: URL,
): Promise<void> {
  const request = state.generation + 1;

  state.generation = request;
  state.pending = true;
  state.destination = url.href;

  try {
    await state.dependencies.navigate(url);
  } catch {
    if (!state.destroyed && request === state.generation && !state.fellBack) {
      state.fellBack = true;
      state.dependencies.fallback(url);
    }
  } finally {
    if (request === state.generation) {
      state.pending = false;
      state.destination = null;
    }
  }
}
