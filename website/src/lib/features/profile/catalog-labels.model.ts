import { requiredText, validateTextMap } from '../content/validation.model.ts';

export function catalogLabels(value: unknown): Record<string, string> {
  const source = validateTextMap(value, 'catalog labels');

  const labels: Record<string, string> = {};

  for (const locale of [
    'en',
    'pt-br',
    'fr',
    'es',
    'it',
    'zh',
  ]) {
    if (source[locale] !== undefined) {
      labels[locale] = requiredText(source[locale], `catalog label ${locale}`);
    }
  }

  requiredText(labels['en'], 'English catalog label');

  requiredText(labels['pt-br'], 'Portuguese catalog label');

  return labels;
}
