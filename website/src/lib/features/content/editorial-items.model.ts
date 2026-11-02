import type { EditorialRecord, SiteData } from './content.types.ts';
import { decorateEditorialItem } from './decorate-editorial-item.model.ts';
import { federatedEditorialItems } from './federated-editorial-items.model.ts';
import { localEditorialItems } from './local-editorial-items.model.ts';

export function editorialItems(
  data: SiteData,
  sectionID: string,
  locale: string,
): EditorialRecord[] {
  const items = [
    ...federatedEditorialItems(data, sectionID, locale),
    ...localEditorialItems(data, sectionID, locale),
  ];

  const output: EditorialRecord[] = [];

  for (const item of items) {
    const decoratedItem = decorateEditorialItem(item, data, locale);

    output.push(decoratedItem);
  }

  return output;
}
