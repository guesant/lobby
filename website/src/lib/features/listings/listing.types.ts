import type { LinkDestination, LinkRecord } from '../content/content.types.ts';

export type ListingDestination = (
  _item: Pick<LinkRecord, 'url' | 'target'>,
) => LinkDestination;

export type EmptyAction = {
  href: string;
  label: string;
};
