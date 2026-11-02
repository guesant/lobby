import { record, requiredText } from './validation.model.ts';

export function defaultLanguage(
  source: Record<string, unknown>,
  languages: Set<string>,
): string {
  const preference = record(
    source['language_preference'],
    'links.language_preference',
  );

  const language = requiredText(
    preference['default'],
    'links.language_preference.default',
  );

  if (!languages.has(language)) {
    throw new Error('Invalid links.language_preference.default');
  }

  return language;
}
