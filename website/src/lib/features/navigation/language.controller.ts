import type { PreferenceStorage } from '../preferences/preferences.model.ts';
import type { LanguagePage } from './language.model.ts';
import {
  languageDestination,
  languageFor,
  selectedLanguage,
} from './language.model.ts';

const languageStorageKey = 'guesant-links-language';

type Dependencies = {
  page: () => LanguagePage | null;
  storage: () => Pick<PreferenceStorage, 'getItem' | 'setItem'>;
  languages: () => readonly string[];
  navigate: (url: URL) => Promise<void>;
  replaceURL: (url: URL) => Promise<void>;
  fallback: (url: URL) => void;
};

export type LanguageNavigation = {
  normalize: () => Promise<void>;
  select: (id: string) => Promise<void>;
  beforeNavigate: (url: URL | null) => void;
  destroy: () => void;
};

class LanguageController {
  #dependencies: Dependencies;

  #generation = 0;

  #pending = false;

  #destroyed = false;

  #fellBack = false;

  #destination: string | null = null;

  constructor(dependencies: Dependencies) {
    this.#dependencies = dependencies;
  }

  #savedLanguage(): string | null {
    try {
      return this.#dependencies.storage()
        .getItem(languageStorageKey);
    } catch {
      return null;
    }
  }

  #remember(id: string): boolean {
    try {
      const storage = this.#dependencies.storage();

      storage.setItem(languageStorageKey, id);

      return storage.getItem(languageStorageKey) === id;
    } catch {
      return false;
    }
  }

  async #navigate(url: URL): Promise<void> {
    const request = ++this.#generation;

    this.#pending = true;
    this.#destination = url.href;

    try {
      await this.#dependencies.navigate(url);
    } catch {
      if (!this.#destroyed && request === this.#generation && !this.#fellBack) {
        this.#fellBack = true;
        this.#dependencies.fallback(url);
      }
    } finally {
      if (request === this.#generation) {
        this.#pending = false;
        this.#destination = null;
      }
    }
  }

  #normalizationTarget(page: LanguagePage): URL | undefined {
    const selected = selectedLanguage(page.context, page.url, {
      saved: this.#savedLanguage(),
      languages: this.#dependencies.languages(),
    });

    if (!selected) {
      return undefined;
    }

    const target = languageDestination(selected, page.url) ?? new URL(page.url);

    const explicit = languageFor(
      page.context,
      page.url.searchParams.get('lang'),
    );

    if (explicit && this.#remember(explicit.id)) {
      target.searchParams.delete('lang');
    }

    return target;
  }

  async normalize(): Promise<void> {
    const page = this.#dependencies.page();

    if (!page || this.#pending || this.#destroyed) {
      return;
    }

    const target = this.#normalizationTarget(page);

    if (!target || target.href === page.url.href) {
      return;
    }

    if (target.pathname === page.url.pathname) {
      await this.#dependencies.replaceURL(target);

      return;
    }

    await this.#navigate(target);
  }

  async select(id: string): Promise<void> {
    const page = this.#dependencies.page();

    if (!page || this.#destroyed) {
      return;
    }

    const route = languageFor(page.context, id);

    const target = route && languageDestination(route, page.url, true);

    if (!target) {
      return;
    }

    if (this.#remember(id)) {
      target.searchParams.delete('lang');
    } else {
      target.searchParams.set('lang', id);
    }

    if (target.href !== page.url.href) {
      await this.#navigate(target);
    }
  }

  beforeNavigate(url: URL | null): void {
    if (this.#pending && url?.href !== this.#destination) {
      this.#generation++;
      this.#pending = false;
      this.#destination = null;
    }
  }

  destroy(): void {
    this.#destroyed = true;
    this.#generation++;
  }
}

export function createLanguageNavigation(
  dependencies: Dependencies,
): LanguageNavigation {
  const controller = new LanguageController(dependencies);

  return {
    normalize: controller.normalize.bind(controller),
    select: controller.select.bind(controller),
    beforeNavigate: controller.beforeNavigate.bind(controller),
    destroy: controller.destroy.bind(controller),
  };
}
