import { languageDestination, languageFor } from './language.model.ts';
import type { LanguageNavigationState } from './language-controller.types.ts';
import { navigateLanguagePage } from './navigate-language-page.ts';
import { rememberLanguage } from './remember-language.ts';

export async function selectLanguage(
  state: LanguageNavigationState,
  id: string,
): Promise<void> {
  const page = state.dependencies.page();

  if (!page || state.destroyed) {
    return;
  }

  const route = languageFor(page.context, id);

  const target = route && languageDestination(route, page.url, true);

  if (!target) {
    return;
  }

  if (rememberLanguage(state, id)) {
    target.searchParams.delete('lang');
  } else {
    target.searchParams.set('lang', id);
  }

  if (target.href !== page.url.href) {
    await navigateLanguagePage(state, target);
  }
}
