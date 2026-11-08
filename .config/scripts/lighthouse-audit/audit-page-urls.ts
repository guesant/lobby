import type { LinkDocument } from '../../../website/src/lib/features/content/content.types.ts';
import { localizedHomePageURLs } from './localized-home-page-urls.ts';
import { pageURLs } from './page-urls.ts';

export function auditPageURLs(data: LinkDocument): string[] {
  const primaryLanguage = data.language_options[0];

  if (primaryLanguage === undefined) {
    return [];
  }

  const urls = pageURLs(data);

  const localizedHomeURLs = localizedHomePageURLs(data);

  urls.push(...localizedHomeURLs);
  urls.push(`${primaryLanguage.path}privacy/`);

  return urls;
}
