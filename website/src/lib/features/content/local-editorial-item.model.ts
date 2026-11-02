import type { EditorialEntry, EditorialRecord } from './content.types.ts';
import { localEditorialLabel } from './local-editorial-label.model.ts';

export function localEditorialItem(
  item: EditorialEntry,
  sectionID: string,
  locale: string,
): EditorialRecord {
  const labels = localEditorialLabel(item, locale);

  return {
    id: item.id,
    type: sectionID,
    source: 'lobby',
    language: labels.language,
    title: labels.title,
    summary: labels.description ?? '',
    url: item.url ?? '',
    tags: item.tags ?? [],
    metadata: {
      group: item.group ?? '',
      status: item.status ?? '',
      updated: item.updated ?? '',
    },
  };
}
