import type { EditorialRecord, SiteData } from './content.types.ts';
import { editorialVisible } from './editorial-visible.model.ts';
import { localEditorialItem } from './local-editorial-item.model.ts';

export function localEditorialItems(
  data: SiteData,
  sectionID: string,
  locale: string,
): EditorialRecord[] {
  const output: EditorialRecord[] = [];

  for (const item of data.editorial.entries[sectionID] ?? []) {
    if (editorialVisible(item)) {
      const localizedItem = localEditorialItem(item, sectionID, locale);

      output.push(localizedItem);
    }
  }

  return output;
}
