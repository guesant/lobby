import { federationFetchTimestamp } from './federation-fetch-timestamp.model.ts';
import { federationSourceID } from './federation-source-id.model.ts';
import { federationSourceMode } from './federation-source-mode.model.ts';
import type { FederationStatus } from './federation-status.types.ts';
import { array, record } from './validation.model.ts';

export function federationStatuses(value: unknown): FederationStatus[] {
  const document = record(value, 'federation status');

  if (document['version'] !== 1) {
    throw new Error('Invalid federation status version');
  }

  const seen = new Set<string>();

  const statuses: FederationStatus[] = [];

  for (const raw of array(document['sources'], 'federation sources')) {
    const source = record(raw, 'federation source status');

    const id = federationSourceID(source['id'], seen);

    const mode = federationSourceMode(source['mode']);

    const lastSuccessfulFetchAt = federationFetchTimestamp(
      source['lastSuccessfulFetchAt'],
    );

    statuses.push({
      id,
      mode,
      lastSuccessfulFetchAt,
    });
  }

  return statuses;
}
