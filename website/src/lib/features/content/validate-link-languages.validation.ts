import type { LinkDocument } from './content.types.ts';

export function validateLinkLanguages(document: LinkDocument): void {
  const languages = document.language_options;

  if (!languages.length) {
    throw new Error('Invalid links.language_options: empty list');
  }

  const ids = new Set<string>();

  for (const language of languages) {
    ids.add(language.id);
  }

  if (ids.size !== languages.length) {
    throw new Error('Invalid links.language_options: duplicate language id');
  }

  if (!ids.has(document.language_preference.default)) {
    throw new Error('Invalid links.language_preference.default');
  }
}
