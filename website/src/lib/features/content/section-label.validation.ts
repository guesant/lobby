import type { SectionRecord } from './content.types.ts';
import { record, requiredText } from './validation.model.ts';

export function sectionLabel(
  value: unknown,
  label: string,
): SectionRecord['labels'][string] {
  const raw = record(value, label);

  return {
    title: requiredText(raw['title'], `${label}.title`),
    description: requiredText(raw['description'], `${label}.description`),
  };
}
