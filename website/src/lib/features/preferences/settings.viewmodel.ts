import type { PageLoadData } from '../content/content.types.ts';
import type { Appearance } from './preferences.model.ts';

type SettingsViewModel = {
  terminal: boolean;
  languageRoutes: (PageLoadData['languageRoutes'][number] & {
    url: string;
  })[];
  themes: {
    value: Appearance;
    label: string;
  }[];
};

export function settingsPresentation(page: PageLoadData): SettingsViewModel {
  const themes: Appearance[] = [
    'system',
    'dark',
    'light',
  ];

  const terminal = page.interfaceName === 'terminal';

  return {
    terminal,
    languageRoutes: page.languageRoutes.map(
      (route): SettingsViewModel['languageRoutes'][number] => {
        let url = route.standardURL;

        if (terminal) {
          url = route.terminalURL;
        }

        return {
          ...route,
          url,
        };
      },
    ),
    themes: themes.map((value): SettingsViewModel['themes'][number] => {
      return {
        value,
        label: page.localized.ui[`theme_${value}`] ?? '',
      };
    }),
  };
}
