import type { PageLoadData } from '../content/content.types.ts';
import { siteOrigin } from '../navigation/origin.model.ts';
import type { Alternate } from './metadata.types.ts';

export function defaultLanguageURL(
  page: PageLoadData,
  routes: Alternate[],
): string {
  const preferred = page.config.language_preference.default;

  for (const route of routes) {
    if (route.id === preferred) {
      return route.href;
    }
  }

  for (const route of routes) {
    if (route.id === 'en') {
      return route.href;
    }
  }

  return routes[0]?.href ?? `${siteOrigin}${page.standardHomeURL}`;
}
