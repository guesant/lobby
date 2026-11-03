import type { PageLoadData } from '../content/content.types.ts';
import type { Appearance } from './preferences.types.ts';

export type SettingsViewModel = {
  terminal: boolean;
  languageRoutes: (PageLoadData['languageRoutes'][number] & {
    url: string;
  })[];
  themes: {
    value: Appearance;
    label: string;
  }[];
};
