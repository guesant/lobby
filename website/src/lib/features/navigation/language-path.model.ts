import type { SiteData } from '../content/content.types.ts';

export function languagePath(data: SiteData, id: string): string | undefined {
  for (const language of data.links.language_options) {
    if (language.id === id) {
      return language.path;
    }
  }

  return undefined;
}
