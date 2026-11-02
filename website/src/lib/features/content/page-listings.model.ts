import { sectionLinks } from '../listings/links.model.ts';
import type { PageContext } from '../navigation/page.model.ts';
import type { SiteData } from './content.types.ts';
import { editorialItems } from './editorial.model.ts';

export function pageListings(
  data: SiteData,
  context: PageContext,
  locale: string,
): {
  links: ReturnType<typeof sectionLinks>;
  editorial: ReturnType<typeof editorialItems>;
} {
  if (!context.page.section) {
    return {
      links: [],
      editorial: [],
    };
  }

  const links = sectionLinks(data, context.page.section, locale);

  const editorial = editorialItems(data, context.page.id, locale);

  return {
    links,
    editorial,
  };
}
