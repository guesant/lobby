import type { FederationItem } from '../../website/src/lib/features/content/content.types.ts';
import { federationStatuses } from '../../website/src/lib/features/content/federation-status.model.ts';
import {
  array,
  record,
} from '../../website/src/lib/features/content/validation.model.ts';
import type { Feed, Source } from './federation.types.ts';
import { atomicJSON, loadFeed } from './federation-cache.ts';
import { sourceID, text } from './federation-validation.ts';
import { mkdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { parse } from 'yaml';

async function federationSources(): Promise<Source[]> {
  const config = record(
    parse(await readFile('.config/federation.yaml', 'utf8')) as unknown,
    'federation configuration',
  );

  return array(config['sources'], 'federation sources')
    .map((value): Source => {
      const source = record(value, 'federation source');

      const id = sourceID(text(source['id']));

      const origin = text(source['origin']);

      const url = text(source['url']);

      if (new URL(url).origin !== origin || new URL(url).protocol !== 'https:') {
        throw new Error('Invalid source URL');
      }

      return {
        id,
        origin,
        url,
      };
    });
}

export async function syncFederation(): Promise<void> {
  const sources = await federationSources();

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
