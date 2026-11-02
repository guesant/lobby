import type { EditorialRecord } from '../content/content.types.ts';

export function editorialEntryIcon(item: EditorialRecord): string | undefined {
  if (item.type === 'project') {
    return 'code';
  }

  return undefined;
}
