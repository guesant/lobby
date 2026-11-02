import type { Feed, LoadOptions, Source } from '../federation.types.ts';
import { sourceID } from '../federation-validation.ts';
import { atomicJSON } from './atomic-json.ts';
import { priorStatus } from './prior-status.ts';
import { selectedFeed } from './selected-feed.ts';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

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

  const feedPath = resolve(options.cacheDirectory, `${id}.json`);

  await atomicJSON(feedPath, loaded.feed);
  await atomicJSON(statusPath, {
    id,
    mode: loaded.mode,
    lastSuccessfulFetchAt: loaded.lastSuccessfulFetchAt,
  });

  return loaded.feed;
}
