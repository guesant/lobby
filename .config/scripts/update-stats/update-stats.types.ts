import type {
  LinkRecord,
  StatisticsSnapshot,
} from '../../../website/src/lib/features/content/content.types.ts';
import type {
  CollectedStats,
  CollectionResult,
  StatisticsFetcher,
} from '../statistics.types.ts';

export type StatisticsUpdateContext = {
  entry: LinkRecord;
  providers: Record<
    string,
    (entry: LinkRecord, fetcher: StatisticsFetcher) => Promise<CollectedStats>
  >;
  ids: Set<string>;
  fetcher: StatisticsFetcher;
  now: () => Date;
  next: Record<string, StatisticsSnapshot>;
  results: CollectionResult[];
  previous: Record<string, StatisticsSnapshot>;
};

export type UpdateStatsOptions = {
  configurationPath?: string;
  outputPath?: string;
  fetcher?: StatisticsFetcher;
  now?: () => Date;
};
