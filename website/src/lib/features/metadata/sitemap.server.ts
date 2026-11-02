import type { SiteData } from '../content/content.types.ts';
import { routeEntries } from '../navigation/catalog.model.ts';
import { siteOrigin } from '../navigation/origin.model.ts';
import { encodeXML } from 'entities';

export function sitemap(data: SiteData, locale?: string): string {
  const paths = new Set(routeEntries(data));

  const urls: string[] = [];

  for (const path of paths) {
    if (locale && !path.startsWith(`${locale}/`) && path !== locale) {
      continue;
    }

    const location = encodeXML(new URL(`/${path}/`, siteOrigin).href);

    urls.push(`<url><loc>${location}</loc></url>`);
  }

  return (
    '<?xml version="1.0" encoding="utf-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
    urls.join('') +
    '</urlset>'
  );
}
