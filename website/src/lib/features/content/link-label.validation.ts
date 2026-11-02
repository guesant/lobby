import type { LinkRecord } from './content.types.ts';
import { optionalProperty } from './object-fields.model.ts';
import { optionalString, record, requiredText } from './validation.model.ts';

export function linkLabel(
  value: unknown,
  label: string,
): LinkRecord['labels'][string] {
  const raw = record(value, label);

  const descriptionValue = optionalString(
    raw['description'],
    `${label}.description`,
  );

  const badgeValue = optionalString(raw['badge'], `${label}.badge`);

  const description = optionalProperty('description', descriptionValue);

  const badge = optionalProperty('badge', badgeValue);

  return {
    title: requiredText(raw['title'], `${label}.title`),
    ...description,
    ...badge,
  };
}
