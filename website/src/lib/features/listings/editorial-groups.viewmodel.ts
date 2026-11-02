import type { EditorialRecord } from '../content/content.types.ts';
import type { EditorialGroup } from './editorial-presentation.types.ts';

export function editorialGroups(
  kinds: string[],
  items: EditorialRecord[],
): EditorialGroup[] {
  const groups: EditorialGroup[] = [];

  for (const type of kinds) {
    const matching: EditorialRecord[] = [];

    for (const item of items) {
      if (item.type === type) {
        matching.push(item);
      }
    }

    groups.push({
      type,
      items: matching,
    });
  }

  return groups;
}
