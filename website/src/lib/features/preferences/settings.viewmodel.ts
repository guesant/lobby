import type { PageLoadData } from '../content/content.types.ts';
import type { SettingsViewModel } from './settings.types.ts';
import { settingsLanguageRoutes } from './settings-language-routes.viewmodel.ts';
import { settingsThemes } from './settings-themes.viewmodel.ts';

export type { SettingsViewModel } from './settings.types.ts';

export function settingsPresentation(page: PageLoadData): SettingsViewModel {
  const terminal = page.interfaceName === 'terminal';

  return {
    terminal,
    languageRoutes: settingsLanguageRoutes(page, terminal),
    themes: settingsThemes(page),
  };
}
