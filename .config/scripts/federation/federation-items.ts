import type { FederationItem } from '../../../website/src/lib/features/content/content.types.ts';
import type { Feed } from '../federation.types.ts';

export function federationItems(feeds: Feed[]): FederationItem[] {
  const items: FederationItem[] = [];

  for (const feed of feeds) {
    items.push(...feed.items);
  }

  return items;
}
