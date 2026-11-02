import type { PageRecord } from '../content/content.types.ts';
import { editorialItems } from '../content/editorial.model.ts';
import { textOr } from '../content/text-or.model.ts';
import { sectionLinks } from '../listings/links.model.ts';
import { indexEditorial } from './index-editorial.server.ts';
import { indexLink } from './index-link.server.ts';
import type { SearchItem } from './search.types.ts';
import type { SearchContext } from './search-context.types.ts';

export function indexPage(
  page: PageRecord,
  context: SearchContext,
): SearchItem[] {
  const {
    data,
    locale,
    ui
  } = context;

  const entry: SearchItem = {
    id: `page-${page.id}`,
    title: page.title,
    summary: page.description,
    url: page.url,
    type: 'page',
    group: textOr(ui['page'], page.title),
    source: 'lobby',
    language: locale,
    tags: [],
  };

  if (page.type !== 'links-page') {
    return [
      entry,
    ];
  }

  if (!page.section) {
    throw new Error(`Missing section: ${page.id}`);
  }

  const output = [
    entry,
  ];

  for (const item of sectionLinks(data, page.section, locale)) {
    const indexedLink = indexLink(item, page, context);

    output.push(indexedLink);
  }

  for (const item of editorialItems(data, page.id, locale)) {
    const indexedItem = indexEditorial(item, page, ui);

    output.push(indexedItem);
  }

  return output;
}
