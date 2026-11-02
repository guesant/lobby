import type { StatisticsSnapshot } from '../../../website/src/lib/features/content/content.types.ts';
import type { CollectionResult } from '../statistics.types.ts';
import { statisticsEntries } from './statistics-entries.ts';
import { updateStatistic } from './update-statistic.ts';
import type { StatisticsUpdateContext } from './update-stats.types.ts';

export async function collectStatistics(input: {
  configurationPath: string;
  providers: StatisticsUpdateContext['providers'];
  fetcher: StatisticsUpdateContext['fetcher'];
  now: StatisticsUpdateContext['now'];
  next: Record<string, StatisticsSnapshot>;
  previous: Record<string, StatisticsSnapshot>;
}): Promise<CollectionResult[]> {
  const results: CollectionResult[] = [];

  const ids = new Set<string>();

  for (const entry of statisticsEntries(input.configurationPath)) {
    await updateStatistic({
      entry,
      providers: input.providers,
      ids,
      fetcher: input.fetcher,
      now: input.now,
      next: input.next,
      results,
      previous: input.previous,
    });
  }

  return results;
}
