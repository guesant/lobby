import type { PageLoadData } from '../content/content.types.ts';
import type { SettingsViewModel } from './settings.types.ts';
import { settingsLanguageRoutes } from './settings-language-routes.viewmodel.ts';
import { settingsThemes } from './settings-themes.viewmodel.ts';

export function settingsPresentation(page: PageLoadData): SettingsViewModel {
  return {
    languageRoutes: settingsLanguageRoutes(page),
    themes: settingsThemes(page),
  };
}
