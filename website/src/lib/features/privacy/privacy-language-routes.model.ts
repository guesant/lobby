import type { PageLoadData } from '../content/content.types.ts';
import { privacyPageURL } from './privacy-page-url.model.ts';

export function privacyLanguageRoutes(
  routes: PageLoadData['languageRoutes'],
): PageLoadData['languageRoutes'] {
  const languageRoutes: PageLoadData['languageRoutes'] = [];

  for (const route of routes) {
    const standardURL = privacyPageURL(route.id, 'voxel');

    const terminalURL = privacyPageURL(route.id, 'terminal');

    languageRoutes.push({
      ...route,
      available: true,
      standardURL,
      terminalURL,
    });
  }

  return languageRoutes;
}
