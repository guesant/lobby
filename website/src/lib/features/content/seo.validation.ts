import type { LinkDocument } from './content.types.ts';
import { record, requiredText } from './validation.model.ts';

export function seoFromUnknown(
  value: unknown,
  label: string,
): LinkDocument['locales'][string]['seo'] {
  const seo = record(value, label);

  return {
    title: requiredText(seo['title'], `${label}.title`),
    description: requiredText(seo['description'], `${label}.description`),
  };
}
