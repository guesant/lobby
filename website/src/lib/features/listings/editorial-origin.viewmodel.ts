import type { EditorialRecord } from '../content/content.types.ts';
import type { EditorialEntryContext } from './editorial-presentation.types.ts';

export function editorialOrigin(
  item: EditorialRecord,
  context: EditorialEntryContext,
): string {
  if (item.language === context.locale) {
    return '';
  }

  return `${context.languageLabel}: ${item.language}`;
}
