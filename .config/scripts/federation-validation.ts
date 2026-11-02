import type { FederationItem } from '../../website/src/lib/features/content/content.types.ts';
import {
  array,
  record,
} from '../../website/src/lib/features/content/validation.model.ts';
import type { Feed, Source } from './federation.types.ts';

const types = new Set([
  'post',
  'case',
  'project',
  'skill',
  'experience',
  'education',
]);

const metadataKeys = new Set([
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

export function text(value: unknown, max = 12000): string {
  if (typeof value !== 'string' || value.length > max) {
    throw new Error('Invalid federation text');
  }

  return value;
}

function itemType(value: unknown): FederationItem['type'] {
  if (typeof value !== 'string' || !types.has(value)) {
    throw new Error('Invalid federation type');
  }

  return value as FederationItem['type'];
}

export function sourceID(value: string): 'blog' | 'resume' {
  if (value !== 'blog' && value !== 'resume') {
    throw new Error('Invalid federation source');
  }

  return value;
}

function contentURL(
  content: string,
  context: {
    source: Source;
    type: unknown;
  },
): string {
  const destination = new URL(content);

  if (
    context.source.id !== 'resume' ||
    context.type !== 'project' ||
    destination.protocol !== 'https:' ||
    destination.username ||
    destination.password ||
    destination.port ||
    ![
      'github.com',
      'gitlab.com',
      'www.youtube.com',
      'youtube.com',
      'youtu.be',
    ].includes(destination.hostname)
  ) {
    throw new Error('Invalid public content URL');
  }

  return destination.href;
}

function metadataFor(
  entry: Record<string, unknown>,
  source: Source,
): FederationItem['metadata'] {
  const metadata: FederationItem['metadata'] = {};

  for (const [
    key,
    value,
  ] of Object.entries(record(entry['metadata'] ?? {}, 'federation metadata'))) {
    if (!metadataKeys.has(key)) {
      continue;
    }

    if (key === 'categories') {
      metadata[key] = array(value, 'categories')
        .map((item): string => {
          return text(item, 200);
        });
      continue;
    }

    const content = text(value, 2048);

    if (key === 'content_url') {
      metadata[key] = contentURL(content, {
        source,
        type: entry['type'],
      });
      continue;
    }

    metadata[key] = content;
  }

  return metadata;
}

function entryIdentity(
  entry: Record<string, unknown>,
  ids: Set<string>,
): {
  id: string;
  language: string;
} {
  const id = text(entry['id'], 128);

  if (!/^[a-z0-9][a-z0-9_-]{0,127}$/.test(id)) {
    throw new Error('Invalid federation identity');
  }

  const language = text(entry['language'], 20)
    .toLowerCase()
    .replaceAll('_', '-');

  if (!/^[a-z]{2,3}(-[a-z0-9]{2,8})*$/.test(language)) {
    throw new Error('Invalid federation language');
  }

  const key = `${id}:${language}`;

  if (ids.has(key)) {
    throw new Error(`Duplicate federation entry: ${key}`);
  }

  ids.add(key);

  return {
    id,
    language,
  };
}

function canonicalURL(value: unknown, source: Source): string {
  const url = new URL(text(value, 2048));

  if (
    url.origin !== source.origin ||
    url.username ||
    url.password ||
    url.protocol !== 'https:'
  ) {
    throw new Error('Invalid federation canonical URL');
  }

  return url.href;
}

function publicTitle(entry: Record<string, unknown>): string {
  if (
    entry['private'] ||
    entry['draft'] ||
    entry['public'] === false ||
    entry['enabled'] === false
  ) {
    throw new Error('Nonpublic federation entry');
  }

  const title = text(entry['title'], 1000);

  if (!title.trim()) {
    throw new Error('Missing federation title');
  }

  return title;
}

function entryTags(value: unknown): string[] {
  const tags = array(value, 'federation tags');

  if (tags.length > 100) {
    throw new Error('Invalid federation tags');
  }

  return tags.map((tag): string => {
    return text(tag, 200);
  });
}

export function validateFeed(value: unknown, source: Source): Feed {
  const feed = record(value, 'federation feed');

  if (
    feed['version'] !== 1 ||
    feed['source'] !== source.id ||
    !Array.isArray(feed['items']) ||
    feed['items'].length > 10000
  ) {
    throw new Error(`Invalid feed: ${source.id}`);
  }

  const sourceName = sourceID(source.id);

  const ids = new Set<string>();

  const items = array(feed['items'], 'federation items')
    .map(
      (value): FederationItem => {
        const entry = record(value, 'federation item');

        return {
          ...entryIdentity(entry, ids),
          source: sourceName,
          type: itemType(entry['type']),
          title: publicTitle(entry),
          summary: text(entry['summary']),
          url: canonicalURL(entry['url'], source),
          tags: entryTags(entry['tags']),
          metadata: metadataFor(entry, source),
        };
      },
    );

  return {
    version: 1,
    source: sourceName,
    items,
  };
}
