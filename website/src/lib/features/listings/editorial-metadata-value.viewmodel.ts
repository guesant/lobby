import type { EditorialRecord } from '../content/content.types.ts';

export function editorialMetadataValue(
  value: EditorialRecord['metadata'][string],
): string {
  if (Array.isArray(value)) {
    return value.join(', ');
  }

  return value;
}
