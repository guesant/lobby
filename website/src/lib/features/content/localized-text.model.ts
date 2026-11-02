import { textOr } from './text-or.model.ts';

export function localizedText(
  translations: Record<string, string>,
  locale: string,
  fallback = '',
): string {
  const english = textOr(translations['en'], fallback);

  return textOr(translations[locale], english);
}
