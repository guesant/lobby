import { errorAppearance } from '../features/navigation/not-found.model.ts';
import type { ErrorLocale } from '../features/navigation/not-found.types.ts';
import { browserPreferenceStorage } from './preference-storage.ts';

export function initializeErrorPage(locales: ErrorLocale[]): {
  selected: string;
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

  let selected = '';

  for (const locale of locales) {
    if (locale.id === parts[0]) {
      selected = locale.id;
      break;
    }
  }

  return {
    selected,
  };
}
