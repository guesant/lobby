import type { EditorialRecord, SiteData } from './content.types.ts';
import { textOr } from './text-or.model.ts';

export function editorialAffiliation(
  item: EditorialRecord,
  data: SiteData,
  locale: string,
): string {
  let affiliation = item.metadata['position'];

  if (item.type === 'education') {
    affiliation = item.metadata['degree'];
  }

  if (typeof affiliation === 'string' && affiliation.trim()) {
    return affiliation.trim();
  }

  return (
    textOr(
      data.editorial.ui[locale]?.['affiliation_unspecified'],
      data.editorial.ui['en']?.['affiliation_unspecified'],
    ) ?? ''
  );
}
