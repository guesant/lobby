import type { LinkRecord } from '../../../website/src/lib/features/content/content.types.ts';
import type { CollectedStats, StatisticsFetcher } from '../statistics.types.ts';

export function statisticConfiguration(
  entry: LinkRecord,
  ids: Set<string>,
  providers: Record<
    string,
    (entry: LinkRecord, fetcher: StatisticsFetcher) => Promise<CollectedStats>
  >,
): {
  stats: NonNullable<LinkRecord['stats']>;
  provider: (
    entry: LinkRecord,
    fetcher: StatisticsFetcher,
  ) => Promise<CollectedStats>;
} {
  const stats = entry.stats;

  const provider = providers[stats?.provider ?? ''];

  if (
    !entry.id ||
    ids.has(entry.id) ||
    !stats ||
    !provider ||
    !stats.metrics.length
  ) {
    throw new Error('Invalid statistics provider configuration');
  }

  return {
    stats,
    provider,
  };
}
