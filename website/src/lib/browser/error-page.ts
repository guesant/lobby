import type { ErrorLocale } from '../features/navigation/not-found.model.ts';
import { errorAppearance } from '../features/navigation/not-found.model.ts';
import { browserPreferenceStorage } from './preference-storage.ts';

export function initializeErrorPage(locales: ErrorLocale[]): {
  selected: string;
  terminal: boolean;
} {
  const parts = window.location.pathname.split('/')
    .filter(Boolean);

  document.body.className = 'error-interface';
  document.documentElement.dataset['interface'] = 'error';

  try {
    const preference = browserPreferenceStorage()
      .getItem(
        'guesant-links-theme',
      );

    document.documentElement.dataset['errorAppearance'] =
      errorAppearance(preference);
  } catch {
    document.documentElement.dataset['errorAppearance'] = 'system';
  }

  return {
    selected:
      locales.find((locale): boolean => {
        return locale.id === parts[0];
      })?.id ?? '',
    terminal: parts[1] === 'terminal',
  };
}
