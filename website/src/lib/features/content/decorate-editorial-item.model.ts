import type { EditorialRecord, SiteData } from './content.types.ts';
import { editorialAffiliation } from './editorial-affiliation.model.ts';
import { platformName } from './platform-name.model.ts';
import { textOr } from './text-or.model.ts';

export function decorateEditorialItem(
  item: EditorialRecord,
  data: SiteData,
  locale: string,
): EditorialRecord {
  if (item.type === 'experience' || item.type === 'education') {
    const affiliation = editorialAffiliation(item, data, locale);

    return {
      ...item,
      title: `${item.title} · ${affiliation}`,
    };
  }

  if (
    item.type !== 'project' ||
    item.source !== 'resume' ||
    typeof item.metadata['content_url'] !== 'string'
  ) {
    return item;
  }

  const detailsURL = item.metadata['content_url'];

  const platform = platformName(detailsURL);

  const localizedLabel = data.editorial.ui[locale]?.['platform_link'];

  const englishLabel = data.editorial.ui['en']?.['platform_link'];

  const defaultLabel = textOr(englishLabel, '{platform}');

  const detailsLabel = textOr(localizedLabel, defaultLabel);

  return {
    ...item,
    details_url: detailsURL,
    details_label: detailsLabel.replace('{platform}', platform),
  };
}
