import type { LanguageContext, LanguagePageData } from './language.types.ts';

export function languageContext(data: LanguagePageData): LanguageContext {
  const terminal = data.interfaceName === 'terminal';

  let current = data.locale;

  if (data.isLanguageEntry) {
    current = '';
  }

  const routes = [];

  for (const route of data.languageRoutes) {
    let home = route.path;

    let url = route.standardURL;

    if (terminal) {
      home += 'terminal/';
      url = route.terminalURL;
    }

    if (!route.available) {
      url = '';
    }

    routes.push({
      id: route.id,
      home,
      url,
    });
  }

  return {
    default: data.config.language_preference.default,
    current,
    neutral: data.isLanguageEntry,
    routes,
  };
}
