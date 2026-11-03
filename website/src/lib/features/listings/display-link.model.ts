import type { DisplayLinkRecord } from '../content/content.types.ts';
import { textOr } from '../content/text-or.model.ts';
import type { DisplayLinkContext } from './display-link.types.ts';
import { displayLinkOptionalFields } from './display-link-optional-fields.model.ts';

export function displayLink(context: DisplayLinkContext): DisplayLinkRecord {
  const {
    data,
    item,
    locale
  } = context;

  const {
    visual,
    ...baseItem
  } = item;

  const labels = item.labels[locale] ?? item.labels['en'];

  if (!labels) {
    throw new Error(`Missing link labels: ${item.id}`);
  }

  const localURL = textOr(
    item.localized_urls?.[locale],
    item.localized_urls?.['en'],
  );

  const configuredURL = textOr(localURL, item.url);

  const fallbackURL = Object.values(item.localized_urls ?? {})[0];

  const url = textOr(configuredURL, fallbackURL);

  if (!url) {
    throw new Error(`Missing link destination: ${item.id}`);
  }

  const optionalFields = displayLinkOptionalFields({
    data,
    item,
    locale,
    labels,
    visual,
  });

  return {
    ...baseItem,
    title: labels.title,
    url,
    language: locale,
    ...optionalFields,
  };
}
