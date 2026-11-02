export function textOr<Fallback extends string | null | undefined>(
  value: string | null | undefined,
  fallback: Fallback,
): string | Fallback {
  if (value) {
    return value;
  }

  return fallback;
}

export function localizedText(
  translations: Record<string, string>,
  locale: string,
  fallback = '',
): string {
  return textOr(translations[locale], textOr(translations['en'], fallback));
}
