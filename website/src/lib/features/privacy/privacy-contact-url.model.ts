import type { PageLoadData } from '../content/content.types.ts';

export function privacyContactURL(links: PageLoadData['quickLinks']): string {
  for (const link of links) {
    if (link.id === 'email' && link.url.startsWith('mailto:')) {
      return link.url;
    }
  }

  throw new Error('Privacy contact email is unavailable');
}
