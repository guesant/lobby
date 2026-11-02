import type { LinkDocument, LinkRecord } from '../content/content.types.ts';
import { isPublished } from './is-published.model.ts';

export function visibleLinks(configuration: LinkDocument): LinkRecord[] {
  const links: LinkRecord[] = [];

  for (const section of configuration.sections) {
    if (!isPublished(section)) {
      continue;
    }

    for (const link of section.links) {
      if (isPublished(link)) {
        links.push(link);
      }
    }
  }

  return links;
}
