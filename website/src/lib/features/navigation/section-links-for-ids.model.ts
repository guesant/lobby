import type { LinkRecord } from '../content/content.types.ts';

export function sectionLinksForIDs(
  ids: string[],
  catalog: LinkRecord[],
): LinkRecord[] {
  const links: LinkRecord[] = [];

  for (const id of ids) {
    for (const entry of catalog) {
      if (entry.id === id) {
        links.push(entry);
      }
    }
  }

  return links;
}
