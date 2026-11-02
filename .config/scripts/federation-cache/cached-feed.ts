import type { Feed, LoadOptions, Source } from '../federation.types.ts';
import { validateFeed } from '../federation-validation.ts';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

export async function cachedFeed(
  source: Source,
  options: LoadOptions,
  reason: unknown,
): Promise<Feed> {
  let feed: Feed;

  try {
    const cachePath = resolve(options.cacheDirectory, `${source.id}.json`);

    const serialized = await readFile(cachePath, 'utf8');

    const content: unknown = JSON.parse(serialized);

    feed = validateFeed(content, source);
  } catch {
    throw new Error(
      `No valid feed or cache for ${source.id}: ${String(reason)}`,
    );
  }

  const warn = options.warn ?? console.warn;

  const reasonText = String(reason);

  warn(`Using last valid ${source.id} feed: ${reasonText}`);

  return feed;
}
