import type { LinkDocument } from '../../../website/src/lib/features/content/content.types.ts';
import { pagesFor } from '../configuration.ts';

export function pageURLs(data: LinkDocument): string[] {
  const primaryLanguage = data.language_options[0];

  if (primaryLanguage === undefined) {
    return [];
  }

  const urls: string[] = [];

  for (const page of pagesFor(data, primaryLanguage.id)) {
    if (page.fallback) {
      continue;
    }

    urls.push(page.url);
  }

  return urls;
}
