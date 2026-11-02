import { validateTextMap } from './validation.model.ts';

export function validateEditorialLocales(
  value: Record<string, unknown>,
  field: string,
): Record<string, Record<string, string>> {
  const locales: Record<string, Record<string, string>> = {};

  for (const [
    locale,
    entry,
  ] of Object.entries(value)) {
    locales[locale] = validateTextMap(entry, `${field}.${locale}`);
  }

  return locales;
}
