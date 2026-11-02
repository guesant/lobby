import type {
  DisplayLinkRecord,
  PageRecord,
} from '../content/content.types.ts';
import { textOr } from '../content/text-or.model.ts';
import type { SearchItem } from './search.types.ts';
import type { SearchContext } from './search-context.types.ts';

export function indexLink(
  item: DisplayLinkRecord,
  page: PageRecord,
  context: SearchContext,
): SearchItem {
  const localizedGroup = textOr(context.ui[page.id], context.ui['page']);

  const group = textOr(localizedGroup, page.title);

  return {
    id: `${page.id}-${item.id}`,
    title: item.title,
    summary: item.description ?? '',
    url: item.url,
    type: 'link',
    group,
    source: 'lobby',
    language: context.locale,
    tags: [],
  };
}
