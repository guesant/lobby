import type { EditorialRecord, PageRecord } from '../content/content.types.ts';
import { textOr } from '../content/text-or.model.ts';
import type { SearchItem } from './search.types.ts';

export function indexEditorial(
  item: EditorialRecord,
  page: PageRecord,
  ui: Record<string, string>,
): SearchItem {
  const localizedGroup = textOr(ui[item.type], ui[page.id]);

  const group = textOr(localizedGroup, page.title);

  return {
    id: `${page.id}-${item.source}-${item.id}`,
    title: item.title,
    summary: item.summary,
    url: textOr(item.url, `${page.url}#page-${page.id}-${item.id}`),
    details_url: item.details_url ?? '',
    details_label: item.details_label ?? '',
    type: item.type,
    group,
    source: item.source,
    language: item.language,
    tags: item.tags,
    metadata: item.metadata,
  };
}
