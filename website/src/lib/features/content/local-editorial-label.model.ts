import type { EditorialEntry } from './content.types.ts';

export function localEditorialLabel(
  item: EditorialEntry,
  locale: string,
): EditorialEntry['labels'][string] & {
  language: string;
} {
  for (const language of [
    locale,
    'pt-br',
    'en',
  ]) {
    const labels = item.labels[language];

    if (labels) {
      return {
        ...labels,
        language,
      };
    }
  }

  throw new Error('Missing editorial entry labels');
}
