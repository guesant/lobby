import type { SiteData } from '../content/content.types.ts';
import { siteOrigin } from '../navigation/origin.model.ts';
import type { AICatalog } from './ai-catalog.types.ts';
import { interfaceNames } from './catalog-context.server.ts';
import { catalogEntries } from './catalog-entries.server.ts';
import { catalogLanguages } from './catalog-languages.server.ts';
import { pageEntries } from './catalog-pages.server.ts';
import { uniqueCatalogEntries } from './unique-catalog-entries.server.ts';

export function aiCatalog(data: SiteData): AICatalog {
  const description =
    data.links.locales[data.links.language_preference.default]?.seo.description;

  if (!description) {
    throw new Error('Missing default language description');
  }

  const entries = catalogEntries(data);

  const uniqueEntries = uniqueCatalogEntries(entries);

  return {
    schema_version: 1,
    name: 'Lobby',
    url: `${siteOrigin}/`,
    description,
    languages: catalogLanguages(data),
    interfaces: [
      ...interfaceNames,
    ],
    pages: pageEntries(data),
    entries: uniqueEntries,
  };
}
