import type { SiteData } from '../content/content.types.ts';
import { localizedText } from '../content/localized-text.model.ts';

export function commitLabel(
  commitSHA: string,
  localized: SiteData['links']['locales'][string]['ui'],
  locale: string,
): string {
  if (commitSHA.length > 7) {
    return commitSHA.slice(0, 7);
  }

  return localizedText(localized, locale, 'local_commit');
}
