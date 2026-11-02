import type { LinkRecord } from '../content/content.types.ts';
import { localizedURL } from './localized-url.model.ts';
import type { ConfiguredPage } from './routes.types.ts';

export function linkedPage(
  entry: LinkRecord,
  language: string,
  fallback: boolean,
): ConfiguredPage {
  const label = entry.labels[language] ?? entry.labels['en'];

  if (!label) {
    throw new Error(`Missing link language: ${entry.id}:${language}`);
  }

  const url = localizedURL(entry, language);

  return {
    id: entry.id,
    type: entry.id,
    title: label.title,
    url,
    icon: entry.icon,
    fallback,
  };
}
