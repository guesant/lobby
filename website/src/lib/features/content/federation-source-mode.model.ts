import type { FederationStatus } from './federation-status.types.ts';

export function federationSourceMode(value: unknown): FederationStatus['mode'] {
  if (value !== 'remote' && value !== 'local' && value !== 'cache') {
    throw new Error('Invalid federation source mode');
  }

  return value;
}
