import type { EditorialEntry } from './content.types.ts';
import { optionalProperty } from './object-fields.model.ts';
import { optionalBoolean } from './validation.model.ts';

export function editorialEntryFlags(
  item: Record<string, unknown>,
  itemLabel: string,
): Pick<EditorialEntry, 'enabled' | 'public' | 'private' | 'draft'> {
  const enabled = optionalBoolean(item['enabled'], `${itemLabel}.enabled`);

  const isPublic = optionalBoolean(item['public'], `${itemLabel}.public`);

  const isPrivate = optionalBoolean(item['private'], `${itemLabel}.private`);

  const draft = optionalBoolean(item['draft'], `${itemLabel}.draft`);

  return {
    ...optionalProperty('enabled', enabled),
    ...optionalProperty('public', isPublic),
    ...optionalProperty('private', isPrivate),
    ...optionalProperty('draft', draft),
  };
}
