import type { BrowserEnvironment } from '../../browser/environment.ts';
import type { LanguageNavigation } from './language.controller.ts';

export type LayoutRuntime = {
  navigation: LanguageNavigation | undefined;
  environment: BrowserEnvironment | undefined;
};
