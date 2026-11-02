import type { SectionRecord, SiteData } from '../content/content.types.ts';

export function pageSection(
  data: SiteData,
  id: string,
): SectionRecord | undefined {
  for (const section of data.links.sections) {
    if (section.id === id) {
      return section;
    }
  }

  return undefined;
}
