import type { EditorialEntry } from './content.types.ts';
import { editorialEntryFields } from './editorial-entry-fields.validation.ts';
import { editorialEntryFlags } from './editorial-entry-flags.validation.ts';
import { validateEditorialLabels } from './validate-editorial-labels.validation.ts';
import { validateEditorialOptions } from './validate-editorial-options.validation.ts';
import { record, requiredText, strings } from './validation.model.ts';

export function validateEditorialEntry(
  section: string,
  index: number,
  rawItem: unknown,
): EditorialEntry {
  const itemLabel = `editorial.entries.${section}[${String(index)}]`;

  const item = record(rawItem, itemLabel);

  const id = requiredText(item['id'], `${itemLabel}.id`);

  const labels = validateEditorialLabels(item['labels'], `${itemLabel}.labels`);

  validateEditorialOptions(item, itemLabel);

  let tags: string[] | undefined;

  if (item['tags'] !== undefined) {
    tags = strings(item['tags'], `${itemLabel}.tags`);
  }

  const fields = editorialEntryFields(item, itemLabel, tags);

  const flags = editorialEntryFlags(item, itemLabel);

  return {
    id,
    labels,
    ...fields,
    ...flags,
  };
}
