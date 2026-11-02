import type { PageLoadData } from '../content/content.types.ts';
import type { SettingsViewModel } from './settings.types.ts';

export function settingsLanguageRoutes(
  page: PageLoadData,
  terminal: boolean,
): SettingsViewModel['languageRoutes'] {
  const output: SettingsViewModel['languageRoutes'] = [];

  for (const route of page.languageRoutes) {
    let url = route.standardURL;

    if (terminal) {
      url = route.terminalURL;
    }

    output.push({
      ...route,
      url,
    });
  }

  return output;
}
