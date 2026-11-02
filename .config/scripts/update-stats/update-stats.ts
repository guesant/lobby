import type {
  LinkRecord,
  StatisticsSnapshot,
} from '../../../website/src/lib/features/content/content.types.ts';
import type {
  CollectedStats,
  CollectionResult,
  StatisticsFetcher,
} from '../statistics.types.ts';
import { collectGitHub } from '../statistics-github.ts';
import { collectLeetCode } from '../statistics-leetcode.ts';
import { collectStatistics } from './collect-statistics.ts';
import { currentTime } from './current-time.ts';
import { hasUpdatedStatistics } from './has-updated-statistics.ts';
import { readPrevious } from './read-previous.ts';
import type { UpdateStatsOptions } from './update-stats.types.ts';
import { writeStatistics } from './write-statistics.ts';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../../..');

const providers: Record<
  string,
  (entry: LinkRecord, fetcher: StatisticsFetcher) => Promise<CollectedStats>
> = {
  github: collectGitHub,
  leetcode: collectLeetCode,
};

export async function updateStats(
  input: UpdateStatsOptions = {},
): Promise<CollectionResult[]> {
  const {
    configurationPath = resolve(root, 'website/src/data/links.yaml'),
    outputPath = resolve(root, 'website/src/data/statistics.yaml'),
    fetcher = fetch,
    now = currentTime,
  } = input;

  const previous = await readPrevious(outputPath);

  const next: Record<string, StatisticsSnapshot> = {
    ...previous,
  };

  const results = await collectStatistics({
    configurationPath,
    providers,
    fetcher,
    now,
    next,
    previous,
  });

  if (hasUpdatedStatistics(results)) {
    await writeStatistics(outputPath, next);
  }

  return results;
}
