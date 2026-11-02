import type { SiteData } from '../content/content.types.ts';

export function knownLocale(data: SiteData, locale: string): boolean {
  for (const language of data.links.language_options) {
    if (language.id === locale) {
      return true;
    }
  }

  return false;
}
