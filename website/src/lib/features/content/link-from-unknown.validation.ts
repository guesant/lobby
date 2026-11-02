import type { LinkRecord } from './content.types.ts';
import { localizedDestinations } from './localized-destinations.validation.ts';
import { localizedLinkLabels } from './localized-link-labels.validation.ts';
import { optionalProperty } from './object-fields.model.ts';
import { optionalLinkFields } from './optional-link-fields.validation.ts';
import { publicationFlags } from './publication-flags.validation.ts';
import { optionalString, record, requiredText } from './validation.model.ts';

export function linkFromUnknown(
  value: unknown,
  label: string,
  languages: Set<string>,
): LinkRecord {
  const source = record(value, label);

  const url = optionalString(source['url'], `${label}.url`);

  const localized = localizedDestinations(
    source['localized_urls'],
    `${label}.localized_urls`,
    languages,
  );

  if (!url && Object.keys(localized).length === 0) {
    throw new Error(`Missing destination at ${label}`);
  }

  let destinations: Pick<LinkRecord, 'localized_urls'> = {};

  if (Object.keys(localized).length > 0) {
    destinations = {
      localized_urls: localized,
    };
  }

  return {
    id: requiredText(source['id'], `${label}.id`),
    ...optionalProperty('url', url),
    ...destinations,
    icon: requiredText(source['icon'], `${label}.icon`),
    labels: localizedLinkLabels(source['labels'], `${label}.labels`, languages),
    ...optionalLinkFields(source, label),
    ...publicationFlags(source, label),
  };
}
