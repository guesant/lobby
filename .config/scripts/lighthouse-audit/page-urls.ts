import type { LinkDocument } from '../../../website/src/lib/features/content/content.types.ts';
import { pagesFor } from '../configuration.ts';

export function pageURLs(data: LinkDocument, terminal: boolean): string[] {
  const primaryLanguage = data.language_options[0];

  if (primaryLanguage === undefined) {
    return [];
  }

  const urls: string[] = [];

  for (const page of pagesFor(data, primaryLanguage.id)) {
    if (page.fallback) {
      continue;
    }

    if (terminal) {
      if (
        ![
          'home',
          'career',
          'code',
        ].includes(page.id)
      ) {
        continue;
      }

      const suffix = page.url.slice(primaryLanguage.path.length);

      urls.push(`${primaryLanguage.path}terminal/${suffix}`);
      continue;
    }

    urls.push(page.url);
  }

  return urls;
}
