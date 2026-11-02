import { createLanguageNavigation } from '../features/navigation/language.controller.ts';
import { browserLanguages } from './browser-languages.ts';
import { browserStorage } from './browser-storage.ts';
import { currentLanguagePage } from './current-language-page.ts';
import { navigateLanguage } from './navigate-language.ts';
import { replaceBrowserLocation } from './replace-browser-location.ts';
import { replaceLanguageURL } from './replace-language-url.ts';

export { selectedLanguageID } from './selected-language-id.ts';
export { updatePageChrome } from './update-page-chrome.ts';

export function createBrowserNavigation(): ReturnType<
  typeof createLanguageNavigation
> {
  return createLanguageNavigation({
    page: currentLanguagePage,
    storage: browserStorage,
    languages: browserLanguages,
    navigate: navigateLanguage,
    replaceURL: replaceLanguageURL,
    fallback: replaceBrowserLocation,
  });
}
