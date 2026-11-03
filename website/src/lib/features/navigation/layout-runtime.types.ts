import type { BrowserEnvironment } from '../../browser/browser-environment.types.ts';
import type { LanguageNavigation } from './language-controller.types.ts';

export type LayoutRuntime = {
  navigation: LanguageNavigation | undefined;
  environment: BrowserEnvironment | undefined;
};
