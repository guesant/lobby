import type { PageLoadData } from '../content/content.types.ts';
import type { Appearance } from './preferences.types.ts';
import type { SettingsViewModel } from './settings.types.ts';

export function settingsThemes(
  page: PageLoadData,
): SettingsViewModel['themes'] {
  const themes: Appearance[] = [
    'system',
    'dark',
    'light',
  ];

  const output: SettingsViewModel['themes'] = [];

  for (const value of themes) {
    output.push({
      value,
      label: page.localized.ui[`theme_${value}`] ?? '',
    });
  }

  return output;
}
