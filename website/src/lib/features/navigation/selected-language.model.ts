import { browserLanguage } from './browser-language.model.ts';
import type { LanguageContext, LanguageRoute } from './language.types.ts';
import { languageFor } from './language-for.model.ts';

export function selectedLanguage(
  context: LanguageContext,
  source: URL,
  preference: {
    saved: string | null;
    languages: readonly string[];
  },
): LanguageRoute | undefined {
  const languageParameter = source.searchParams.get('lang');

  const explicit = languageFor(context, languageParameter);

  if (explicit) {
    return explicit;
  }

  const saved = languageFor(context, preference.saved);

  if (saved) {
    return saved;
  }

  if (!context.neutral) {
    return undefined;
  }

  return browserLanguage(context, preference.languages);
}
