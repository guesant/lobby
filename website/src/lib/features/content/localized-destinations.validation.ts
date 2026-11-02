import { requiredText, validateTextMap } from './validation.model.ts';

export function localizedDestinations(
  value: unknown,
  label: string,
  languages: Set<string>,
): Record<string, string> {
  if (value === undefined) {
    return {};
  }

  const urls = validateTextMap(value, label);

  for (const language of Object.keys(urls)) {
    if (!languages.has(language)) {
      throw new Error(`Unknown localized URL language: ${language}`);
    }

    requiredText(urls[language], `${label}.${language}`);
  }

  return urls;
}
