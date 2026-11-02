import type {
  DisplayLinkRecord,
  SectionRecord,
  SiteData,
} from '../content/content.types.ts';
import { linksForSection } from '../navigation/routes.model.ts';
import { displayLink } from './display-link.model.ts';

export function sectionLinks(
  data: SiteData,
  section: SectionRecord,
  locale: string,
): DisplayLinkRecord[] {
  const output: DisplayLinkRecord[] = [];

  for (const item of linksForSection(data.links, section)) {
    const link = displayLink({
      data,
      item,
      locale,
    });

    output.push(link);
  }

  return output;
}
