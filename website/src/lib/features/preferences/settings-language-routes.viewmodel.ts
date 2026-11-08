import type { PageLoadData } from '../content/content.types.ts';
import type { SettingsViewModel } from './settings.types.ts';

export function settingsLanguageRoutes(
  page: PageLoadData,
): SettingsViewModel['languageRoutes'] {
  const output: SettingsViewModel['languageRoutes'] = [];

  for (const route of page.languageRoutes) {
    output.push({
      ...route,
      url: route.standardURL,
    });
  }

  return output;
}
