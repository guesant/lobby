import type { FederationItem } from '../../../website/src/lib/features/content/content.types.ts';
import { federationTypes } from './constants.ts';

export function itemType(value: unknown): FederationItem['type'] {
  if (typeof value !== 'string' || !federationTypes.has(value)) {
    throw new Error('Invalid federation type');
  }

  return value as FederationItem['type'];
}
