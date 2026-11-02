import type { EditorialEntry } from './content.types.ts';
import { optionalProperty } from './object-fields.model.ts';
import { optionalString } from './validation.model.ts';

export function editorialEntryFields(
  item: Record<string, unknown>,
  itemLabel: string,
  tags: string[] | undefined,
): Pick<EditorialEntry, 'url' | 'tags' | 'group' | 'status' | 'updated'> {
  const url = optionalString(item['url'], `${itemLabel}.url`);

  const group = optionalString(item['group'], `${itemLabel}.group`);

  const status = optionalString(item['status'], `${itemLabel}.status`);

  const updated = optionalString(item['updated'], `${itemLabel}.updated`);

  return {
    ...optionalProperty('url', url),
    ...optionalProperty('tags', tags),
    ...optionalProperty('group', group),
    ...optionalProperty('status', status),
    ...optionalProperty('updated', updated),
  };
}
