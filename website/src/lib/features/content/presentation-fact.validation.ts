import type { LinkDocument } from './content.types.ts';
import { record, requiredText } from './validation.model.ts';

export function presentationFact(
  value: unknown,
  label: string,
): LinkDocument['locales'][string]['presentation']['facts'][number] {
  const item = record(value, label);

  return {
    icon: requiredText(item['icon'], `${label}.icon`),
    text: requiredText(item['text'], `${label}.text`),
  };
}
