import { record, requiredText } from './validation.model.ts';

export type CreditEntry = {
  id: string;
  name: string;
  authors: string;
  license: string;
  official_url: string;
};

export function validateCreditEntry(
  rawEntry: unknown,
  index: number,
): CreditEntry {
  const label = `credits.entries[${String(index)}]`;

  const entry = record(rawEntry, label);

  return {
    id: requiredText(entry['id'], `${label}.id`),
    name: requiredText(entry['name'], `${label}.name`),
    authors: requiredText(entry['authors'], `${label}.authors`),
    license: requiredText(entry['license'], `${label}.license`),
    official_url: requiredText(entry['official_url'], `${label}.official_url`),
  };
}
