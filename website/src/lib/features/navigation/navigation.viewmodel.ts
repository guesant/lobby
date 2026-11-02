import type { PageLoadData } from '../content/content.types.ts';
import type { LanguagePageData } from './language.model.ts';

export type NavigationPresentation = LanguagePageData &
  Pick<PageLoadData, 'page' | 'localized'>;

function languageData(data: Partial<PageLoadData>): LanguagePageData | null {
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

export function navigationPresentation(
  data: Partial<PageLoadData>,
  status: number,
): NavigationPresentation | null {
  const language = languageData(data);

  if (!language || status >= 400 || !data.localized || !data.page) {
    return null;
  }

  return {
    ...language,
    localized: data.localized,
    page: data.page,
  };
}

export function interfaceBodyClass(
  interfaceName: PageLoadData['interfaceName'],
): string {
  if (interfaceName === 'terminal') {
    return 'terminal-interface';
  }

  return 'theme-minecraft appearance-system background-default';
}
