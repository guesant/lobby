import type { EditorialEntry } from './content.types.ts';
import { validateEditorialEntry } from './validate-editorial-entry.validation.ts';
import { array } from './validation.model.ts';

export function validateEditorialEntries(
  value: Record<string, unknown>,
): Record<string, EditorialEntry[]> {
  const entries: Record<string, EditorialEntry[]> = {};

  for (const [
    section,
    rawItems,
  ] of Object.entries(value)) {
    const sectionEntries: EditorialEntry[] = [];

    for (const [
      index,
      rawItem,
    ] of array(rawItems, `editorial.entries.${section}`)
        .entries()) {
      const entry = validateEditorialEntry(section, index, rawItem);

      sectionEntries.push(entry);
    }

    entries[section] = sectionEntries;
  }

  return entries;
}
