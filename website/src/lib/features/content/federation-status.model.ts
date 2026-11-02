import { array, record } from './validation.model.ts';

export type FederationStatus = {
  id: 'blog' | 'resume';
  mode: 'remote' | 'local' | 'cache';
  lastSuccessfulFetchAt: string | null;
};

function sourceIdentity(
  value: unknown,
  seen: Set<string>,
): FederationStatus['id'] {
  if ((value !== 'blog' && value !== 'resume') || seen.has(value)) {
    throw new Error('Invalid federation source identity');
  }

  seen.add(value);

  return value;
}

function sourceMode(value: unknown): FederationStatus['mode'] {
  if (value !== 'remote' && value !== 'local' && value !== 'cache') {
    throw new Error('Invalid federation source mode');
  }

  return value;
}

function fetchTimestamp(value: unknown): string | null {
  if (value === null) {
    return null;
  }

  if (
    typeof value !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}T/.test(value) ||
    !Number.isFinite(Date.parse(value))
  ) {
    throw new Error('Invalid federation fetch timestamp');
  }

  return value;
}

export function federationStatuses(value: unknown): FederationStatus[] {
  const document = record(value, 'federation status');

  if (document['version'] !== 1) {
    throw new Error('Invalid federation status version');
  }

  const seen = new Set<string>();

  return array(document['sources'], 'federation sources')
    .map(
      (value): FederationStatus => {
        const source = record(value, 'federation source status');

        return {
          id: sourceIdentity(source['id'], seen),
          mode: sourceMode(source['mode']),
          lastSuccessfulFetchAt: fetchTimestamp(source['lastSuccessfulFetchAt']),
        };
      },
    );
}
