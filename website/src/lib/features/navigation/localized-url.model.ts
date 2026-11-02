import type { LinkRecord } from '../content/content.types.ts';
import { textOr } from '../content/text-or.model.ts';

export function localizedURL(entry: LinkRecord, language: string): string {
  const localized = textOr(
    entry.localized_urls?.[language],
    entry.localized_urls?.['en'],
  );

  const url = textOr(localized, entry.url);

  if (!url) {
    throw new Error(`Missing URL: ${entry.id}`);
  }

  return url;
}
