import type { LinkRecord, SiteData } from '../content/content.types.ts';
import { quickLinkVisible } from './quick-link-visible.model.ts';

export function findQuickLink(
  data: SiteData,
  id: string,
): LinkRecord | undefined {
  for (const section of data.links.sections) {
    for (const link of section.links) {
      if (link.id === id && quickLinkVisible(link)) {
        return link;
      }
    }
  }

  return undefined;
}
