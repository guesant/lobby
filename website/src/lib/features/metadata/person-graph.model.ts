import type { PageLoadData } from '../content/content.types.ts';
import { siteOrigin } from '../navigation/origin.model.ts';
import { personSameAs } from './person-same-as.model.ts';

export function personGraph(
  page: PageLoadData,
  image: string,
): Record<string, string | string[]> {
  return {
    '@type': 'Person',
    '@id': `${siteOrigin}/#person`,
    name: page.config.profile.name,
    alternateName: `@${page.config.profile.username}`,
    url: siteOrigin,
    image,
    sameAs: personSameAs(page),
  };
}
