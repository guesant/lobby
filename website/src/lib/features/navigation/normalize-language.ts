import type { LanguageNavigationState } from './language-controller.types.ts';
import { languageNormalizationTarget } from './language-normalization-target.ts';
import { navigateLanguagePage } from './navigate-language-page.ts';

export async function normalizeLanguage(
  state: LanguageNavigationState,
): Promise<void> {
  const page = state.dependencies.page();

  if (!page || state.pending || state.destroyed) {
    return;
  }

  const target = languageNormalizationTarget(state, page);

  if (!target || target.href === page.url.href) {
    return;
  }

  if (target.pathname === page.url.pathname) {
    await state.dependencies.replaceURL(target);

    return;
  }

  await navigateLanguagePage(state, target);
}
