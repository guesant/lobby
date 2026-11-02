import type { PageLoadData, SiteData } from '../content/content.types.ts';
import { localizedURL } from '../navigation/routes.model.ts';
import { findQuickLink } from './find-quick-link.model.ts';

export function quickLinkForID(
  data: SiteData,
  id: string,
  locale: string,
): PageLoadData['quickLinks'] {
  const item = findQuickLink(data, id);

  if (!item) {
    return [];
  }

  const labels = item.labels[locale] ?? item.labels['en'];

  if (!labels) {
    throw new Error(`Missing link labels: ${id}`);
  }

  return [
    {
      ...item,
      title: labels.title,
      url: localizedURL(item, locale),
    },
  ];
}
