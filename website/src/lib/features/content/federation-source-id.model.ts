import type { FederationStatus } from './federation-status.types.ts';

export function federationSourceID(
  value: unknown,
  seen: Set<string>,
): FederationStatus['id'] {
  if ((value !== 'blog' && value !== 'resume') || seen.has(value)) {
    throw new Error('Invalid federation source identity');
  }

  seen.add(value);

  return value;
}
