import { sectionLinks } from '../listings/links.model.ts';
import type { PageRecord, SiteData } from './content.types.ts';
import type { PageLoadData } from './content.types.ts';
import { editorialItems } from './editorial.model.ts';
import { summarizePage } from './summarize-page.model.ts';

export function homeSectionContent(
  data: SiteData,
  entry: PageRecord,
  locale: string,
): PageLoadData['homeSections'][number] {
  if (!entry.section) {
    throw new Error(`Missing section: ${entry.id}`);
  }

  return {
    page: summarizePage(entry),
    links: sectionLinks(data, entry.section, locale),
    editorial: editorialItems(data, entry.id, locale),
  };
}
