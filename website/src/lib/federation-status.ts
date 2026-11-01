import { array, record } from './validation-primitives.ts';

export type FederationStatus = {
  id: 'blog' | 'resume';
  mode: 'remote' | 'local' | 'cache';
  lastSuccessfulFetchAt: string | null;
};

export function federationStatuses(value: unknown): FederationStatus[] {
  const document = record(value, 'federation status');

  if (document.version !== 1) {
    throw new Error('Invalid federation status version');
  }

  const seen = new Set<string>();

  return array(document.sources, 'federation sources')
    .map(
      (value): FederationStatus => {
        const source = record(value, 'federation source status');

        if (
          (source.id !== 'blog' && source.id !== 'resume') ||
        seen.has(source.id)
        ) {
          throw new Error('Invalid federation source identity');
        }

        if (
          source.mode !== 'remote' &&
        source.mode !== 'local' &&
        source.mode !== 'cache'
        ) {
          throw new Error('Invalid federation source mode');
        }

        const timestamp = source.lastSuccessfulFetchAt;

        if (
          timestamp !== null &&
        (typeof timestamp !== 'string' ||
          !/^\d{4}-\d{2}-\d{2}T/.test(timestamp) ||
          !Number.isFinite(Date.parse(timestamp)))
        ) {
          throw new Error('Invalid federation fetch timestamp');
        }

        seen.add(source.id);

        return {
          id: source.id,
          mode: source.mode,
          lastSuccessfulFetchAt: timestamp,
        };
      },
    );
}
