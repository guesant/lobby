import type { FederationItem } from './content.types.ts';

export type FederationIdentity = Pick<
  FederationItem,
  'id' | 'source' | 'language' | 'type'
>;

export type FederationContentIdentity = Pick<FederationItem, 'source' | 'type'>;
