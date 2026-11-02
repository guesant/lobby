import { federationStatuses } from '../../../website/src/lib/features/content/federation-status.model.ts';
import { atomicJSON } from '../federation-cache.ts';
import { federationItems } from './federation-items.ts';
import { federationSources } from './federation-sources.ts';
import { loadFederationFeeds } from './load-federation-feeds.ts';
import { loadFederationStatuses } from './load-federation-statuses.ts';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

export async function syncFederation(): Promise<void> {
  const sources = await federationSources();

  const feeds = await loadFederationFeeds(sources);

  const directory = resolve('.cache/federation/assets');

  await mkdir(directory, {
    recursive: true,
  });

  const statuses = await loadFederationStatuses(sources);

  const items = federationItems(feeds);

  const federationPath = resolve(directory, 'federation.json');

  const statusPath = resolve(directory, 'status.json');

  const validatedStatuses = federationStatuses({
    version: 1,
    sources: statuses,
  });

  const federationDocument = {
    version: 1,
    items,
  };

  const statusDocument = {
    version: 1,
    sources: validatedStatuses,
  };

  await atomicJSON(federationPath, federationDocument);

  await atomicJSON(statusPath, statusDocument);
}
