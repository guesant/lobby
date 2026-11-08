import type { PageLoadData } from '../content/content.types.ts';
import { siteOrigin } from '../navigation/origin.model.ts';
import type { Alternate } from './metadata.types.ts';

export function alternateRoutes(page: PageLoadData): Alternate[] {
  const output: Alternate[] = [];

  for (const route of page.languageRoutes) {
    if (!route.available) {
      continue;
    }

    output.push({
      id: route.id,
      href: `${siteOrigin}${route.standardURL}`,
      hreflang: route.hreflang,
      ogLocale: route.ogLocale,
    });
  }

  return output;
}
