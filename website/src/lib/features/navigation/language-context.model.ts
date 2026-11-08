import type { LanguageContext, LanguagePageData } from './language.types.ts';

export function languageContext(data: LanguagePageData): LanguageContext {
  let current = data.locale;

  if (data.isLanguageEntry) {
    current = '';
  }

  const routes = [];

  for (const route of data.languageRoutes) {
    let url = route.standardURL;

    if (!route.available) {
      url = '';
    }

    routes.push({
      id: route.id,
      home: route.path,
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
