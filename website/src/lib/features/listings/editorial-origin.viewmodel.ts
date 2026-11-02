import type { EditorialRecord } from '../content/content.types.ts';
import type { EditorialEntryContext } from './editorial-presentation.types.ts';

export function editorialOrigin(
  item: EditorialRecord,
  context: EditorialEntryContext,
): string {
  if (context.interfaceName === 'terminal') {
    if (item.language === context.locale) {
      return item.source;
    }

    return `${item.source}· ${context.languageLabel}: ${item.language}`;
  }

  if (item.language === context.locale) {
    return '';
  }

  return `${context.languageLabel}: ${item.language}`;
}
