import type { PageLoadData, SiteData } from '../content/content.types.ts';
import { pagesFor } from './catalog.model.ts';
import { pageDestination } from './page-destination.model.ts';

export function languageRoutes(
  data: SiteData,
  pageID: string,
): PageLoadData['languageRoutes'] {
  const routes: PageLoadData['languageRoutes'] = [];

  for (const option of data.links.language_options) {
    const standard = pagesFor(data, option.id, 'voxel');

    const terminal = pagesFor(data, option.id, 'terminal');

    let available = false;

    for (const page of standard) {
      if (page.id === pageID && !page.fallback) {
        available = true;
        break;
      }
    }

    const standardURL = pageDestination(standard, pageID);

    const terminalURL = pageDestination(terminal, pageID);

    const ogLocale = data.links.locales[option.id]?.ui['og_locale'] ?? '';

    routes.push({
      ...option,
      ogLocale,
      available,
      standardURL,
      terminalURL,
    });
  }

  return routes;
}
