import type { Feed, Source } from '../federation.types.ts';
import { loadFeed } from '../federation-cache.ts';
import { resolve } from 'node:path';

export async function loadFederationFeeds(sources: Source[]): Promise<Feed[]> {
  const cacheDirectory = resolve('.cache/federation');

  const feeds: Feed[] = [];

  for (const source of sources) {
    const localFile = process.env[`LOBBY_${source.id.toUpperCase()}_FEED`];

    const feed = await loadFeed(source, {
      cacheDirectory,
      localFile,
    });

    feeds.push(feed);
  }

  return feeds;
}
