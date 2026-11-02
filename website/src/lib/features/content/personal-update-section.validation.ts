import type { LinkDocument } from './content.types.ts';
import { record, requiredText } from './validation.model.ts';

export function personalUpdateSection(
  value: unknown,
  label: string,
): LinkDocument['now'][string]['sections'][number] {
  const item = record(value, label);

  return {
    id: requiredText(item['id'], `${label}.id`),
    title: requiredText(item['title'], `${label}.title`),
    description: requiredText(item['description'], `${label}.description`),
  };
}
