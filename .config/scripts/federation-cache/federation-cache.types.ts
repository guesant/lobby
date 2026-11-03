import type { FederationStatus } from '../../../website/src/lib/features/content/federation-status.types.ts';
import type { Feed } from '../federation.types.ts';

export type LoadedFeed = {
  feed: Feed;
  mode: FederationStatus['mode'];
  lastSuccessfulFetchAt: string | null;
};
