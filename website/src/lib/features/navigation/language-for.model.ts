import type { LanguageContext, LanguageRoute } from './language.types.ts';

export function languageFor(
  context: LanguageContext,
  id: string | null,
): LanguageRoute | undefined {
  for (const route of context.routes) {
    if (route.id === id) {
      return route;
    }
  }

  return undefined;
}
