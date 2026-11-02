import type { PageLoadData } from '../content/content.types.ts';
import { siteOrigin } from '../navigation/origin.model.ts';

export function pageIdentity(
  page: PageLoadData,
  canonical: string,
): Record<
  string,
  | string
  | {
    '@id': string;
  }
> {
  if (page.page.id === 'home') {
    return {
      '@type': 'ProfilePage',
      '@id': `${canonical}#profile`,
      mainEntity: {
        '@id': `${siteOrigin}/#person`,
      },
    };
  }

  return {
    '@type': 'WebPage',
    '@id': `${canonical}#page`,
    about: {
      '@id': `${siteOrigin}/#person`,
    },
  };
}
