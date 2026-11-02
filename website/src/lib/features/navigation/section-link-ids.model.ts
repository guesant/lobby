import type { LinkRecord, SectionRecord } from '../content/content.types.ts';
import { hasLinkDefinition } from './has-link-definition.model.ts';

export function sectionLinkIDs(
  section: SectionRecord,
  definitions: LinkRecord[],
): string[] {
  const ids: string[] = [];

  for (const entry of section.links) {
    ids.push(entry.id);
  }

  for (const id of section.link_refs ?? []) {
    if (!hasLinkDefinition(id, definitions)) {
      throw new Error(`Unknown link reference: ${id}`);
    }

    if (ids.includes(id)) {
      throw new Error(`Duplicate section link: ${id}`);
    }

    ids.push(id);
  }

  return ids;
}
