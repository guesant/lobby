import type { PageLoadData } from '../content/content.types.ts';
import { siteOrigin } from '../navigation/origin.model.ts';
import type { Alternate } from './metadata.types.ts';

export function alternateRoutes(page: PageLoadData): Alternate[] {
  const output: Alternate[] = [];

  for (const route of page.languageRoutes) {
    if (!route.available) {
      continue;
    }

    let path = route.standardURL;

    if (page.interfaceName === 'terminal') {
      path = route.terminalURL;
    }

    output.push({
      id: route.id,
      href: `${siteOrigin}${path}`,
      hreflang: route.hreflang,
      ogLocale: route.ogLocale,
    });
  }

  return output;
}
