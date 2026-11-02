import type { LanguageNavigation } from '../features/navigation/language.controller.ts';
import { createLanguageNavigation } from '../features/navigation/language.controller.ts';
import type { LanguagePage } from '../features/navigation/language.model.ts';
import { languageContext } from '../features/navigation/language.model.ts';
import type { NavigationPresentation } from '../features/navigation/navigation.viewmodel.ts';
import { interfaceBodyClass } from '../features/navigation/navigation.viewmodel.ts';
import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import { page } from '$app/state';

export function createBrowserNavigation(
  current: () => NavigationPresentation | null,
): LanguageNavigation {
  return createLanguageNavigation({
    page(): LanguagePage | null {
      const presentation = current();

      if (!presentation) {
        return null;
      }

      return {
        context: languageContext(presentation),
        url: new URL(window.location.href),
      };
    },
    storage(): Storage {
      return window.localStorage;
    },
    languages(): readonly string[] {
      return navigator.languages;
    },
    async navigate(url): Promise<void> {
      await goto(resolve(`${url.pathname.slice(1)}${url.search}${url.hash}`), {
        replace: true,
        reset: false,
      });

      if (page.status >= 400) {
        throw new Error('Language destination could not be loaded');
      }
    },
    async replaceURL(url): Promise<void> {
      await goto(resolve(`${url.pathname.slice(1)}${url.search}${url.hash}`), {
        state: page.state,
        shallow: true,
        replace: true,
        reset: false,
      });
    },
    fallback(url): void {
      window.location.replace(url.href);
    },
  });
}

export function updatePageChrome(data: NavigationPresentation | null): void {
  if (!data) {
    return;
  }

  document.documentElement.dataset['interface'] = data.interfaceName;
  document.documentElement.dataset['interfaceReady'] = 'true';
  document.documentElement.dataset['page'] = data.page.id;
  document.documentElement.lang = data.localized.ui.html_lang;
  document.body.className = interfaceBodyClass(data.interfaceName);
}

export function selectedLanguageID(event: Event): string | undefined {
  const select = event.target;

  if (
    !(select instanceof HTMLSelectElement) ||
    !select.matches('[data-language-switcher]')
  ) {
    return undefined;
  }

  return select.selectedOptions.item(0)?.dataset['language'];
}
