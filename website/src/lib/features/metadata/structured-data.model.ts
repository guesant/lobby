import type { PageLoadData } from '../content/content.types.ts';
import { siteOrigin } from '../navigation/origin.model.ts';
import type { StructuredPageMetadata } from './metadata.types.ts';
import { pageIdentity } from './page-identity.model.ts';
import { personGraph } from './person-graph.model.ts';
import { jsonScriptContent } from './serialization.model.ts';

export function structuredData(
  page: PageLoadData,
  metadata: StructuredPageMetadata,
): string {
  const website = `${siteOrigin}/${page.locale}/`;

  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      personGraph(page, metadata.ogImageURL),
      {
        '@type': 'WebSite',
        '@id': `${website}#website`,
        url: website,
        name: page.localized.seo.title,
        description: page.localized.seo.description,
        inLanguage: page.localized.ui.html_lang,
        publisher: {
          '@id': `${siteOrigin}/#person`,
        },
      },
      {
        ...pageIdentity(page, metadata.canonical),
        url: metadata.canonical,
        name: metadata.title,
        description: metadata.description,
        inLanguage: page.localized.ui.html_lang,
        isPartOf: {
          '@id': `${website}#website`,
        },
      },
    ],
  };

  const serializedGraph = JSON.stringify(graph);

  return jsonScriptContent(serializedGraph);
}
