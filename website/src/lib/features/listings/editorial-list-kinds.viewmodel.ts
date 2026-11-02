import type { EditorialRecord } from '../content/content.types.ts';
import { editorialKinds } from '../content/editorial-kinds.model.ts';

export function editorialListKinds(
  items: EditorialRecord[],
  sectionID: string,
): string[] {
  const configured = editorialKinds[sectionID];

  if (configured) {
    return [
      ...configured,
    ];
  }

  const kinds = new Set<string>();

  for (const item of items) {
    kinds.add(item.type);
  }

  return [
    ...kinds,
  ];
}
