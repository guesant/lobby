import type { LinkRecord, SectionRecord } from './content.types.ts';
import { optionalProperty } from './object-fields.model.ts';
import type { UnknownRecord } from './validation.model.ts';
import {
  optionalBoolean,
  optionalString,
  record,
  requiredText,
  strings,
  validateTextMap,
} from './validation.model.ts';

export function optionalStrings(
  value: unknown,
  label: string,
): string[] | undefined {
  if (value === undefined) {
    return undefined;
  }

  return strings(value, label);
}

export function publicationFlags(
  source: UnknownRecord,
  label: string,
): Pick<LinkRecord, 'enabled' | 'public' | 'private' | 'draft' | 'featured'> {
  const flags: Pick<
    LinkRecord,
    'enabled' | 'public' | 'private' | 'draft' | 'featured'
  > = {};

  for (const key of [
    'enabled',
    'public',
    'private',
    'draft',
    'featured',
  ] as const) {
    const value = optionalBoolean(source[key], `${label}.${key}`);

    if (value !== undefined) {
      flags[key] = value;
    }
  }

  return flags;
}

function mapLanguageLabels<Label>(
  languages: Set<string>,
  read: (language: string) => Label,
): Record<string, Label> {
  const labels: Record<string, Label> = {};

  for (const language of languages) {
    labels[language] = read(language);
  }

  return labels;
}

function localizedLinkLabels(
  value: unknown,
  label: string,
  languages: Set<string>,
): LinkRecord['labels'] {
  const source = record(value, label);

  return mapLanguageLabels(
    languages,
    (language): LinkRecord['labels'][string] => {
      const key = `${label}.${language}`;

      const raw = record(source[language], key);

      return {
        title: requiredText(raw['title'], `${key}.title`),
        ...optionalProperty(
          'description',
          optionalString(raw['description'], `${key}.description`),
        ),
        ...optionalProperty(
          'badge',
          optionalString(raw['badge'], `${key}.badge`),
        ),
      };
    },
  );
}

export function sectionLabels(
  value: unknown,
  label: string,
  languages: Set<string>,
): SectionRecord['labels'] {
  const source = record(value, label);

  return mapLanguageLabels(
    languages,
    (language): SectionRecord['labels'][string] => {
      const key = `${label}.${language}`;

      const raw = record(source[language], key);

      return {
        title: requiredText(raw['title'], `${key}.title`),
        description: requiredText(raw['description'], `${key}.description`),
      };
    },
  );
}

function localizedDestinations(
  value: unknown,
  label: string,
  languages: Set<string>,
): Record<string, string> {
  if (value === undefined) {
    return {};
  }

  const urls = validateTextMap(value, label);

  for (const language of Object.keys(urls)) {
    if (!languages.has(language)) {
      throw new Error(`Unknown localized URL language: ${language}`);
    }

    requiredText(urls[language], `${label}.${language}`);
  }

  return urls;
}

function positiveInteger(value: unknown, label: string): number {
  if (!Number.isInteger(value) || Number(value) < 1) {
    throw new Error(`Invalid ${label}`);
  }

  return Number(value);
}

function linkStats(value: unknown, label: string): LinkRecord['stats'] {
  if (value === undefined) {
    return undefined;
  }

  const raw = record(value, label);

  return {
    provider: requiredText(raw['provider'], `${label}.provider`),
    metrics: strings(raw['metrics'], `${label}.metrics`),
  };
}

function linkVisual(value: unknown, label: string): LinkRecord['visual'] {
  if (value === undefined) {
    return undefined;
  }

  const raw = record(value, label);

  return {
    src: requiredText(raw['src'], `${label}.src`),
    alt: validateTextMap(raw['alt'], `${label}.alt`),
    kind: requiredText(raw['kind'], `${label}.kind`),
    width: positiveInteger(raw['width'], `${label}.width`),
    height: positiveInteger(raw['height'], `${label}.height`),
  };
}

function optionalLinkFields(
  source: UnknownRecord,
  label: string,
): Pick<
  LinkRecord,
  | 'title'
  | 'description'
  | 'badge'
  | 'target'
  | 'audiences'
  | 'stats'
  | 'visual'
> {
  return {
    ...optionalProperty(
      'title',
      optionalString(source['title'], `${label}.title`),
    ),
    ...optionalProperty(
      'description',
      optionalString(source['description'], `${label}.description`),
    ),
    ...optionalProperty(
      'badge',
      optionalString(source['badge'], `${label}.badge`),
    ),
    ...optionalProperty(
      'target',
      optionalString(source['target'], `${label}.target`),
    ),
    ...optionalProperty(
      'audiences',
      optionalStrings(source['audiences'], `${label}.audiences`),
    ),
    ...optionalProperty('stats', linkStats(source['stats'], `${label}.stats`)),
    ...optionalProperty(
      'visual',
      linkVisual(source['visual'], `${label}.visual`),
    ),
  };
}

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

  if (!url && !Object.keys(localized).length) {
    throw new Error(`Missing destination at ${label}`);
  }

  let destinations: Pick<LinkRecord, 'localized_urls'> = {};

  if (Object.keys(localized).length) {
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
