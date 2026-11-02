import type {
  LinkRecord,
  PageLoadData,
  SiteData,
} from '../content/content.types.ts';
import { localizedURL } from '../navigation/routes.model.ts';

function visible(link: LinkRecord): boolean {
  return (
    link.enabled !== false &&
    link.public !== false &&
    !link.private &&
    !link.draft
  );
}

function quickLink(
  data: SiteData,
  id: string,
  locale: string,
): PageLoadData['quickLinks'] {
  const item = data.links.sections
    .flatMap((section): LinkRecord[] => {
      return section.links;
    })
    .find((link): boolean => {
      return link.id === id && visible(link);
    });

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

export function quickLinks(
  data: SiteData,
  locale: string,
): PageLoadData['quickLinks'] {
  return data.links.quick_contacts.flatMap((id): PageLoadData['quickLinks'] => {
    return quickLink(data, id, locale);
  });
}
