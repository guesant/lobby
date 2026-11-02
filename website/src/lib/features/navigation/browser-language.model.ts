import type { LanguageContext, LanguageRoute } from './language.types.ts';
import { languageFor } from './language-for.model.ts';

export function browserLanguage(
  context: LanguageContext,
  languages: readonly string[],
): LanguageRoute | undefined {
  for (const tag of languages) {
    const normalized = tag.toLowerCase()
      .replaceAll('_', '-');

    const exact = languageFor(context, normalized);

    if (exact) {
      return exact;
    }

    const language = normalized.split('-')[0];

    for (const route of context.routes) {
      if (route.id.split('-')[0] === language) {
        return route;
      }
    }
  }

  return languageFor(context, context.default);
}
