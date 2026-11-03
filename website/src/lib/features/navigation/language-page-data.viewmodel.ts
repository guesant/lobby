import type { PageLoadData } from '../content/content.types.ts';
import type { LanguagePageData } from './language.types.ts';

export function languagePageData(
  data: Partial<PageLoadData>,
): LanguagePageData | null {
  if (
    !data.config ||
    !data.interfaceName ||
    !data.locale ||
    !data.languageRoutes ||
    typeof data.isLanguageEntry !== 'boolean'
  ) {
    return null;
  }

  return {
    config: data.config,
    interfaceName: data.interfaceName,
    isLanguageEntry: data.isLanguageEntry,
    locale: data.locale,
    languageRoutes: data.languageRoutes,
  };
}
