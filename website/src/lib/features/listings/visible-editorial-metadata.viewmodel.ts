import type { EditorialRecord } from '../content/content.types.ts';

export function visibleEditorialMetadata(
  item: EditorialRecord,
  key: string,
): boolean {
  if (key === 'content_url') {
    return false;
  }

  if (item.type === 'experience' && key === 'position') {
    return false;
  }

  return item.type !== 'education' || key !== 'degree';
}
