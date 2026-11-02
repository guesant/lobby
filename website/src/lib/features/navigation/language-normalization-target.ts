import {
  languageDestination,
  languageFor,
  selectedLanguage,
} from './language.model.ts';
import type { LanguagePage } from './language.types.ts';
import type { LanguageNavigationState } from './language-controller.types.ts';
import { rememberLanguage } from './remember-language.ts';
import { savedLanguage } from './saved-language.ts';

export function languageNormalizationTarget(
  state: LanguageNavigationState,
  page: LanguagePage,
): URL | undefined {
  const saved = savedLanguage(state);

  const languages = state.dependencies.languages();

  const selected = selectedLanguage(page.context, page.url, {
    saved,
    languages,
  });

  if (!selected) {
    return undefined;
  }

  const target = languageDestination(selected, page.url) ?? new URL(page.url);

  const languageParameter = page.url.searchParams.get('lang');

  const explicit = languageFor(page.context, languageParameter);

  if (explicit && rememberLanguage(state, explicit.id)) {
    target.searchParams.delete('lang');
  }

  return target;
}
