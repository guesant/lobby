import type { LinkDocument } from './content.types.ts';
import { record, requiredText } from './validation.model.ts';

export function languageOption(
  value: unknown,
  label: string,
): LinkDocument['language_options'][number] {
  const language = record(value, label);

  return {
    id: requiredText(language['id'], `${label}.id`),
    path: requiredText(language['path'], `${label}.path`),
    label: requiredText(language['label'], `${label}.label`),
    hreflang: requiredText(language['hreflang'], `${label}.hreflang`),
  };
}
