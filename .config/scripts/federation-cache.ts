import {
  type FederationStatus,
  federationStatuses,
} from '../../website/src/lib/features/content/federation-status.model.ts';
import type { Feed, LoadOptions, Source } from './federation.types.ts';
import { sourceID, validateFeed } from './federation-validation.ts';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

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

export async function atomicJSON(path: string, value: unknown): Promise<void> {
  await writeFile(`${path}.tmp`, JSON.stringify(value));
  await rename(`${path}.tmp`, path);
}

type LoadedFeed = {
  feed: Feed;
  mode: FederationStatus['mode'];
  lastSuccessfulFetchAt: string | null;
};

async function cachedFeed(
  source: Source,
  options: LoadOptions,
  reason: unknown,
): Promise<Feed> {
  let feed: Feed;

  try {
    const content: unknown = JSON.parse(
      await readFile(
        resolve(options.cacheDirectory, `${source.id}.json`),
        'utf8',
      ),
    );

    feed = validateFeed(content, source);
  } catch {
    throw new Error(
      `No valid feed or cache for ${source.id}: ${String(reason)}`,
    );
  }

  const warn = options.warn ?? console.warn;

  warn(`Using last valid ${source.id} feed: ${String(reason)}`);

  return feed;
}

async function remoteFeed(
  source: Source,
  options: LoadOptions,
  prior: string | null,
): Promise<LoadedFeed> {
  let bytes: string;

  try {
    const response = await requestFeed(source, options.fetcher ?? fetch);

    bytes = await response.text();
  } catch (error) {
    return {
      feed: await cachedFeed(source, options, error),
      mode: 'cache',
      lastSuccessfulFetchAt: prior,
    };
  }

  if (bytes.length > 5_000_000) {
    throw new Error('Federation feed too large');
  }

  const feed = validateFeed(JSON.parse(bytes) as unknown, source);

  const now = options.now ?? defaultNow;

  return {
    feed,
    mode: 'remote',
    lastSuccessfulFetchAt: now()
      .toISOString(),
  };
}

function defaultNow(): Date {
  return new Date();
}

async function selectedFeed(
  source: Source,
  options: LoadOptions,
  prior: string | null,
): Promise<LoadedFeed> {
  if (options.localFile) {
    const content: unknown = JSON.parse(
      await readFile(options.localFile, 'utf8'),
    );

    return {
      feed: validateFeed(content, source),
      mode: 'local',
      lastSuccessfulFetchAt: prior,
    };
  }

  return remoteFeed(source, options, prior);
}

export async function loadFeed(
  source: Source,
  options: LoadOptions,
): Promise<Feed> {
  await mkdir(options.cacheDirectory, {
    recursive: true,
  });

  const id = sourceID(source.id);

  const statusPath = resolve(options.cacheDirectory, `${id}.status.json`);

  const prior = await priorStatus(statusPath, id);

  const loaded = await selectedFeed(source, options, prior);

  await atomicJSON(resolve(options.cacheDirectory, `${id}.json`), loaded.feed);
  await atomicJSON(statusPath, {
    id,
    mode: loaded.mode,
    lastSuccessfulFetchAt: loaded.lastSuccessfulFetchAt,
  });

  return loaded.feed;
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
    throw new Error(`HTTP ${String(response.status)}`);
  }

  return response;
}
