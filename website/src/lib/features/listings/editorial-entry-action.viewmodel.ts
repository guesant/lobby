import type { LinkDestination } from '../content/content.types.ts';
import type { ListingDestination } from './listing.model.ts';

export function editorialEntryAction(
  url: string | undefined,
  destination: ListingDestination,
): LinkDestination | undefined {
  if (!url) {
    return undefined;
  }

  return destination({
    url,
  });
}
