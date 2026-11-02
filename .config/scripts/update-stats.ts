import type {
  LinkRecord,
  StatisticsSnapshot,
} from '../../website/src/lib/features/content/content.types.ts';
import { validateStatistics } from '../../website/src/lib/features/content/statistics.validation.ts';
import { requiredText } from '../../website/src/lib/features/content/validation.model.ts';
import { readConfiguration } from './configuration.ts';
import type {
  CollectedStats,
  CollectionResult,
  StatisticsFetcher,
} from './statistics.types.ts';
import { collectGitHub } from './statistics-github.ts';
import { collectLeetCode } from './statistics-leetcode.ts';
import { integer } from './statistics-request.ts';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parse, stringify } from 'yaml';

const root = resolve(import.meta.dirname, '../..');

const providers: Record<
  string,
  (entry: LinkRecord, fetcher: StatisticsFetcher) => Promise<CollectedStats>
> = {
  github: collectGitHub,
  leetcode: collectLeetCode,
};

async function readPrevious(
  outputPath: string,
): Promise<Record<string, StatisticsSnapshot>> {
  try {
    const source = await readFile(outputPath, 'utf8');

    if (!source) {
      return {};
    }

    return validateStatistics(parse(source) as unknown);
  } catch (error) {
    if (
      !(error instanceof Error) ||
      !('code' in error) ||
      error.code !== 'ENOENT'
    ) {
      throw error;
    }

    return {};
  }
}

async function writeStatistics(
  outputPath: string,
  next: Record<string, StatisticsSnapshot>,
): Promise<void> {
  await mkdir(dirname(outputPath), {
    recursive: true,
  });

  const temporary = `${outputPath}.${String(process.pid)}.tmp`;

  await writeFile(temporary, stringify(next), {
    mode: 0o644,
  });
  await rename(temporary, outputPath);
}

function statisticsEntries(configurationPath: string): LinkRecord[] {
  return readConfiguration(configurationPath)
    .sections.filter((section): boolean => {
      return section.enabled !== false && section.public !== false;
    })
    .flatMap((section): LinkRecord[] => {
      return section.links;
    })
    .filter((entry): boolean => {
      return (
        entry.enabled !== false &&
        entry.public !== false &&
        Boolean(entry.stats)
      );
    });
}

export async function updateStats(
  input: {
    configurationPath?: string;
    outputPath?: string;
    fetcher?: StatisticsFetcher;
    now?: () => Date;
  } = {},
): Promise<CollectionResult[]> {
  const {
    configurationPath = resolve(root, 'website/src/data/links.yaml'),
    outputPath = resolve(root, 'website/src/data/statistics.yaml'),
    fetcher = fetch,
    now = (): Date => {
      return new Date();
    },
  } = input;

  const previous = await readPrevious(outputPath);

  const next = {
    ...previous,
  };

  const results: CollectionResult[] = [];

  const entries = statisticsEntries(configurationPath);

  const ids = new Set<string>();

  for (const entry of entries) {
    await updateStatistic({
      entry,
      providers,
      ids,
      fetcher,
      now,
      next,
      results,
      previous,
    });
  }

  if (
    results.some((entry): boolean => {
      return entry.status === 'updated';
    })
  ) {
    await writeStatistics(outputPath, next);
  }

  return results;
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  console.log(JSON.stringify(await updateStats()));
}

type StatisticUpdateContext = {
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

async function updateStatistic(input: StatisticUpdateContext): Promise<void> {
  const {
    entry,
    providers,
    ids,
    fetcher,
    now,
    next,
    results,
    previous
  } =
    input;

  const {
    stats,
    provider
  } = statisticConfiguration(entry, ids, providers);

  const profileURL = requiredText(entry.url, 'statistics profile URL');

  ids.add(entry.id);

  try {
    const data = await provider(entry, fetcher);

    const snapshot: StatisticsSnapshot = {
      ...data,
      profile_url: profileURL,
      provider: stats.provider,
      updated_at: now()
        .toISOString(),
    };

    for (const key of stats.metrics) {
      integer(snapshot.metrics[key]);
    }

    next[entry.id] = snapshot;
    results.push({
      id: entry.id,
      status: 'updated',
    });
  } catch (error) {
    results.push({
      id: entry.id,
      status: failureStatus(entry, previous, stats.provider),
      reason: String(error),
    });
  }
}

function statisticConfiguration(
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

function failureStatus(
  entry: LinkRecord,
  previous: Record<string, StatisticsSnapshot>,
  provider: string,
): 'cached' | 'unavailable' {
  if (
    previous[entry.id]?.profile_url === entry.url &&
    previous[entry.id]?.provider === provider
  ) {
    return 'cached';
  }

  return 'unavailable';
}
