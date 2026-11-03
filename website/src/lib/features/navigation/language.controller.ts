import { beforeLanguageNavigation } from './before-language-navigation.ts';
import { destroyLanguageNavigation } from './destroy-language-navigation.ts';
import type {
  LanguageDependencies,
  LanguageNavigation,
  LanguageNavigationState,
} from './language-controller.types.ts';
import { normalizeLanguage } from './normalize-language.ts';
import { selectLanguage } from './select-language.ts';

export function createLanguageNavigation(
  dependencies: LanguageDependencies,
): LanguageNavigation {
  const state: LanguageNavigationState = {
    dependencies,
    generation: 0,
    pending: false,
    destroyed: false,
    fellBack: false,
    destination: null,
  };

  return {
    normalize: normalizeLanguage.bind(null, state),
    select: selectLanguage.bind(null, state),
    beforeNavigate: beforeLanguageNavigation.bind(null, state),
    destroy: destroyLanguageNavigation.bind(null, state),
  };
}
