import type { LinkDocument } from '../../../website/src/lib/features/content/content.types.ts';
import { localizedHomePageURLs } from './localized-home-page-urls.ts';
import { pageURLs } from './page-urls.ts';

export function auditPageURLs(data: LinkDocument): string[] {
  const primaryLanguage = data.language_options[0];

  if (primaryLanguage === undefined) {
    return [];
  }

  const urls = pageURLs(data, false);

  const localizedHomeURLs = localizedHomePageURLs(data);

  const primaryTerminalURLs = pageURLs(data, true);

  urls.push(...localizedHomeURLs);
  urls.push(...primaryTerminalURLs);
  urls.push(`${primaryLanguage.path}privacy/`);
  urls.push(`${primaryLanguage.path}terminal/privacy/`);

  return urls;
}
