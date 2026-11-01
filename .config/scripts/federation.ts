import { parse } from 'yaml';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { array, record } from '../../website/src/lib/validation-primitives.ts';
import {
  federationStatuses,
  type FederationStatus,
} from '../../website/src/lib/federation-status.ts';
import type { FederationItem } from '../../website/src/lib/site-data.ts';

type Source = {
  id: string;
  origin: string;
  url?: string;
};

type Feed = {
  version: 1;
  source: 'blog' | 'resume';
  items: FederationItem[];
};

type LoadOptions = {
  cacheDirectory: string;
  localFile?: string | undefined;
  fetcher?: (
    url: string,
    options?: RequestInit,
  ) => Promise<{
    ok: boolean;
    status?: number;
    text(): Promise<string>;
  }>;
  warn?: (message: string) => void;
  now?: () => Date;
};

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

function text(value: unknown, max: number = 12000): string {
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

function sourceID(value: string): 'blog' | 'resume' {
  if (value !== 'blog' && value !== 'resume') {
    throw new Error('Invalid federation source');
  }

  return value;
}

function metadataFor(
  entry: Record<string, unknown>,
  source: Source,
): FederationItem['metadata'] {
  const metadata: FederationItem['metadata'] = {};

  for (const [
    key,
    value,
  ] of Object.entries(record(entry.metadata ?? {}, 'federation metadata'))) {
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
      const destination = new URL(content);

      if (
        source.id !== 'resume' ||
        entry.type !== 'project' ||
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

      metadata[key] = destination.href;
      continue;
    }

    metadata[key] = content;
  }

  return metadata;
}

export function validateFeed(value: unknown, source: Source): Feed {
  const feed = record(value, 'federation feed');

  if (
    feed.version !== 1 ||
    feed.source !== source.id ||
    !Array.isArray(feed.items) ||
    feed.items.length > 10000
  ) {
    throw new Error(`Invalid feed: ${source.id}`);
  }

  const sourceName = sourceID(source.id);

  const ids = new Set<string>();

  const items = array(feed.items, 'federation items')
    .map(
      (value): FederationItem => {
        const entry = record(value, 'federation item');

        const id = text(entry.id, 128);

        if (!/^[a-z0-9][a-z0-9_-]{0,127}$/.test(id)) {
          throw new Error('Invalid federation identity');
        }

        const language = text(entry.language, 20)
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

        const url = new URL(text(entry.url, 2048));

        if (
          url.origin !== source.origin ||
        url.username ||
        url.password ||
        url.protocol !== 'https:'
        ) {
          throw new Error('Invalid federation canonical URL');
        }

        if (
          entry.private ||
        entry.draft ||
        entry.public === false ||
        entry.enabled === false
        ) {
          throw new Error('Nonpublic federation entry');
        }

        const title = text(entry.title, 1000);

        if (!title.trim()) {
          throw new Error('Missing federation title');
        }

        const tags = array(entry.tags, 'federation tags');

        if (tags.length > 100) {
          throw new Error('Invalid federation tags');
        }

        return {
          id,
          source: sourceName,
          language,
          type: itemType(entry.type),
          title,
          summary: text(entry.summary),
          url: url.href,
          tags: tags.map((tag): string => {
            return text(tag, 200);
          }),
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

async function priorStatus(
  path: string,
  id: 'blog' | 'resume',
): Promise<string | null> {
  try {
    const value: unknown = JSON.parse(await readFile(path, 'utf8'));

    const [
      status,
    ] = federationStatuses({
      version: 1,
      sources: [
        value,
      ],
    });

    if (status?.id === id) {
      return status.lastSuccessfulFetchAt;
    }

    throw new Error('Federation status identity mismatch');
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return null;
    }

    throw error;
  }
}

async function atomicJSON(path: string, value: unknown): Promise<void> {
  await writeFile(`${path}.tmp`, JSON.stringify(value));
  await rename(`${path}.tmp`, path);
}

export async function loadFeed(
  source: Source,
  {
    cacheDirectory,
    localFile,
    fetcher = fetch,
    warn = console.warn,
    now = (): Date => {
      return new Date();
    },
  }: LoadOptions,
): Promise<Feed> {
  await mkdir(cacheDirectory, {
    recursive: true,
  });

  const id = sourceID(source.id);

  const cache = resolve(cacheDirectory, `${id}.json`);

  const statusPath = resolve(cacheDirectory, `${id}.status.json`);

  let lastSuccessfulFetchAt = await priorStatus(statusPath, id);

  let mode: FederationStatus['mode'] = 'remote';

  let feed: Feed | undefined;

  if (localFile) {
    feed = validateFeed(
      JSON.parse(await readFile(localFile, 'utf8')) as unknown,
      source,
    );
    mode = 'local';
  } else {
    let bytes: string | undefined;

    try {
      const response = await requestFeed(source, fetcher);

      bytes = await response.text();
    } catch (error) {
      const reason = String(error);

      try {
        feed = validateFeed(
          JSON.parse(await readFile(cache, 'utf8')) as unknown,
          source,
        );
      } catch {
        throw new Error(`No valid feed or cache for ${id}: ${reason}`);
      }

      mode = 'cache';
      warn(`Using last valid ${id} feed: ${reason}`);
    }

    if (bytes !== undefined) {
      if (bytes.length > 5_000_000) {
        throw new Error('Federation feed too large');
      }

      feed = validateFeed(JSON.parse(bytes) as unknown, source);
      lastSuccessfulFetchAt = now()
        .toISOString();
    }
  }

  if (!feed) {
    throw new Error(`Missing feed: ${id}`);
  }

  await atomicJSON(cache, feed);
  await atomicJSON(statusPath, {
    id,
    mode,
    lastSuccessfulFetchAt,
  });

  return feed;
}

async function requestFeed(
  source: Source,
  fetcher: NonNullable<LoadOptions['fetcher']>,
): ReturnType<NonNullable<LoadOptions['fetcher']>> {
  if (!source.url) {
    throw new Error('Missing federation source URL');
  }

  const response = await fetcher(source.url, {
    signal: AbortSignal.timeout(10000),
    redirect: 'error',
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response;
}

export async function syncFederation(): Promise<void> {
  const config = record(
    parse(await readFile('.config/federation.yaml', 'utf8')) as unknown,
    'federation configuration',
  );

  const sources = array(config.sources, 'federation sources')
    .map(
      (value): Source => {
        const source = record(value, 'federation source');

        const id = sourceID(text(source.id));

        const origin = text(source.origin);

        const url = text(source.url);

        if (
          new URL(url).origin !== origin ||
        new URL(url).protocol !== 'https:'
        ) {
          throw new Error('Invalid source URL');
        }

        return {
          id,
          origin,
          url,
        };
      },
    );

  const feeds = await Promise.all(
    sources.map((source): Promise<Feed> => {
      return loadFeed(source, {
        cacheDirectory: resolve('.cache/federation'),
        localFile: process.env[`LOBBY_${source.id.toUpperCase()}_FEED`],
      });
    }),
  );

  const directory = resolve('.cache/federation/assets');

  await mkdir(directory, {
    recursive: true,
  });

  const statuses: unknown[] = await Promise.all(
    sources.map(async (source): Promise<unknown> => {
      return JSON.parse(
        await readFile(
          resolve('.cache/federation', `${source.id}.status.json`),
          'utf8',
        ),
      ) as unknown;
    }),
  );

  await atomicJSON(resolve(directory, 'federation.json'), {
    version: 1,
    items: feeds.flatMap((feed): FederationItem[] => {
      return feed.items;
    }),
  });
  await atomicJSON(resolve(directory, 'status.json'), {
    version: 1,
    sources: federationStatuses({
      version: 1,
      sources: statuses,
    }),
  });
}
