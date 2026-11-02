import type { FederationItem, SiteData } from './content.types.ts';
import {
  array,
  record,
  requiredText,
  strings,
  type UnknownRecord,
} from './validation.model.ts';

function federationType(value: unknown, label: string): FederationItem['type'] {
  switch (requiredText(value, label)) {
    case 'post':
      return 'post';

    case 'case':
      return 'case';

    case 'project':
      return 'project';

    case 'skill':
      return 'skill';

    case 'experience':
      return 'experience';

    case 'education':
      return 'education';

    default:
      throw new Error(`Invalid ${label}`);
  }
}

function federationIdentity(
  item: UnknownRecord,
  label: string,
): Pick<FederationItem, 'id' | 'source' | 'language' | 'type'> {
  const id = requiredText(item['id'], `${label}.id`);

  if (!/^[a-z0-9][a-z0-9_-]{0,127}$/.test(id)) {
    throw new Error(`Invalid ${label}.id`);
  }

  const source = requiredText(item['source'], `${label}.source`);

  if (source !== 'blog' && source !== 'resume') {
    throw new Error(`Invalid ${label}.source`);
  }

  const language = requiredText(item['language'], `${label}.language`);

  if (!/^[a-z]{2,3}(-[a-z0-9]{2,8})*$/.test(language)) {
    throw new Error(`Invalid ${label}.language`);
  }

  const type = federationType(item['type'], `${label}.type`);

  return {
    id,
    source,
    language,
    type,
  };
}

function federationSummary(value: unknown, label: string): string {
  if (typeof value !== 'string' || value.length > 12000) {
    throw new Error(`Invalid ${label}.summary`);
  }

  return value;
}

function federationURL(value: unknown, label: string): string {
  const url = new URL(requiredText(value, `${label}.url`));

  if (url.protocol !== 'https:' || url.username || url.password) {
    throw new Error(`Invalid ${label}.url`);
  }

  return url.href;
}

function validateFederationItem(
  rawItem: unknown,
  index: number,
  identities: Set<string>,
): FederationItem {
  const label = `federation.items[${String(index)}]`;

  const item = record(rawItem, label);

  const identity = federationIdentity(item, label);

  const key = `${identity.source}:${identity.id}:${identity.language}`;

  if (identities.has(key)) {
    throw new Error(`Duplicate federation item: ${key}`);
  }

  identities.add(key);

  return {
    ...identity,
    title: requiredText(item['title'], `${label}.title`),
    summary: federationSummary(item['summary'], label),
    url: federationURL(item['url'], label),
    tags: strings(item['tags'], `${label}.tags`),
    metadata: validateFederationMetadata(item['metadata'], label, identity),
  };
}

function validateFederationMetadata(
  value: unknown,
  label: string,
  identity: Pick<FederationItem, 'source' | 'type'>,
): FederationItem['metadata'] {
  const raw = record(value, `${label}.metadata`);

  const allowed = new Set([
    'date',
    'updated',
    'categories',
    'position',
    'degree',
    'area',
    'start_date',
    'end_date',
    'content_url',
  ]);

  const metadata: FederationItem['metadata'] = {};

  for (const [
    key,
    entry,
  ] of Object.entries(raw)) {
    if (!allowed.has(key)) {
      continue;
    }

    if (key === 'categories') {
      metadata[key] = strings(entry, `${label}.metadata.categories`);
      continue;
    }

    const field = requiredText(entry, `${label}.metadata.${key}`);

    if (key === 'content_url') {
      metadata[key] = validateContentURL(field, label, identity);
      continue;
    }

    metadata[key] = field;
  }

  return metadata;
}

function validateContentURL(
  value: string,
  label: string,
  identity: Pick<FederationItem, 'source' | 'type'>,
): string {
  const url = new URL(value);

  const allowedHosts = [
    'github.com',
    'gitlab.com',
    'youtube.com',
    'www.youtube.com',
    'youtu.be',
  ];

  if (
    identity.source !== 'resume' ||
    identity.type !== 'project' ||
    url.protocol !== 'https:' ||
    url.username ||
    url.password ||
    url.port ||
    !allowedHosts.includes(url.hostname)
  ) {
    throw new Error(`Invalid ${label}.metadata.content_url`);
  }

  return url.href;
}

export function validateFederation(value: unknown): SiteData['federation'] {
  const feed = record(value, 'federation data');

  if (feed['version'] !== 1) {
    throw new Error('Invalid federation.version');
  }

  const identities = new Set<string>();

  const items = array(feed['items'], 'federation.items')
    .map(
      (item, index): FederationItem => {
        return validateFederationItem(item, index, identities);
      },
    );

  return {
    version: 1,
    items,
  };
}
