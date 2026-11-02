import type { PageLoadData, SiteData } from '../content/content.types.ts';
import { quickLinkForID } from './quick-link-for-id.model.ts';

export function quickLinks(
  data: SiteData,
  locale: string,
): PageLoadData['quickLinks'] {
  const links: PageLoadData['quickLinks'] = [];

  for (const id of data.links.quick_contacts) {
    const quickLinks = quickLinkForID(data, id, locale);

    links.push(...quickLinks);
  }

  return links;
}
