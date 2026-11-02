import type { LinkDocument } from './content.types.ts';
import { localeFromUnknown } from './locale.validation.ts';
import { record } from './validation.model.ts';

export function localesFromUnknown(
  value: unknown,
  languages: Set<string>,
): LinkDocument['locales'] {
  const raw = record(value, 'links.locales');

  const locales: LinkDocument['locales'] = {};

  for (const language of languages) {
    locales[language] = localeFromUnknown(
      raw[language],
      `links.locales.${language}`,
    );
  }

  return locales;
}
