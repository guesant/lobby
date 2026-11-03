import type { PageContext } from '../navigation/page.types.ts';
import type { PageLoadData } from './content.types.ts';
import type { SiteData } from './content.types.ts';
import { homeSectionContent } from './home-section-content.model.ts';

export function homeSectionContents(
  data: SiteData,
  context: PageContext,
): PageLoadData['homeSections'] {
  if (context.page.id !== 'home') {
    return [];
  }

  const sections: PageLoadData['homeSections'] = [];

  for (const entry of context.pages) {
    if (entry.type === 'links-page') {
      const section = homeSectionContent(data, entry, context.locale);

      sections.push(section);
    }
  }

  return sections;
}
