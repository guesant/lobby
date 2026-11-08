import type { LinkDocument } from '../../../website/src/lib/features/content/content.types.ts';
import { pagesFor } from '../configuration.ts';

export function localizedHomePageURLs(data: LinkDocument): string[] {
  const primaryLanguage = data.language_options[0];

  if (primaryLanguage === undefined) {
    return [];
  }

  const urls: string[] = [];

  for (const language of data.language_options) {
    if (language.id === primaryLanguage.id) {
      continue;
    }

    for (const page of pagesFor(data, language.id)) {
      if (page.id === 'home' && !page.fallback) {
        urls.push(page.url);
      }
    }
  }

  return urls;
}
