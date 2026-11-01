import { parse, stringify } from 'yaml';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { readConfiguration } from './configuration.ts';
import { validateStatistics } from '../../website/src/lib/content-validation.ts';
import {
  array,
  record,
  requiredText,
} from '../../website/src/lib/validation-primitives.ts';
import type {
  LinkRecord,
  StatisticsSnapshot,
} from '../../website/src/lib/site-data.ts';

type StatisticsFetcher = (
  url: string,
  options?: RequestInit,
) => Promise<Pick<Response, 'ok' | 'status' | 'json'>>;

type CollectedStats = {
  username: string;
  metrics: Record<string, number>;
  available?: Record<string, number>;
};

type CollectionResult = {
  id: string;
  status: 'updated' | 'cached' | 'unavailable';
  reason?: string;
};

const root = resolve(import.meta.dirname, '../..');

function integer(value: unknown): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0) {
    throw new Error('Invalid public statistic');
  }

  return value;
}

async function request(
  url: string,
  options: RequestInit,
  fetcher: StatisticsFetcher,
): Promise<unknown> {
  const response = await fetcher(url, {
    ...options,
    redirect: 'error',
    signal: AbortSignal.timeout(20000),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json() as Promise<unknown>;
}

export async function collectGitHub(
  entry: Pick<LinkRecord, 'url'>,
  fetcher: StatisticsFetcher = fetch,
): Promise<CollectedStats> {
  const url = new URL(requiredText(entry.url, 'GitHub profile URL'));

  const parts = url.pathname.split('/')
    .filter(Boolean);

  const username = parts[0];

  if (url.hostname !== 'github.com' || parts.length !== 1 || !username) {
    throw new Error('GitHub statistics require a profile URL');
  }

  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2026-03-10',
  };

  if (process.env.GITHUB_STATS_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_STATS_TOKEN}`;
  }

  const endpoint = `https://api.github.com/users/${encodeURIComponent(username)}`;

  const user = record(
    await request(
      endpoint,
      {
        headers,
      },
      fetcher,
    ),
    'GitHub profile',
  );

  const login = requiredText(user.login, 'GitHub login');

  if (login.toLowerCase() !== username.toLowerCase()) {
    throw new Error('GitHub returned a different profile');
  }

  const repositories = new Map<
    number,
    {
      stars: number;
      forks: number;
    }
  >();

  for (let page = 1; ; page += 1) {
    if (page > 100) {
      throw new Error('GitHub pagination exceeded safety limit');
    }

    const entries = array(
      await request(
        `${endpoint}/repos?type=owner&per_page=100&page=${page}`,
        {
          headers,
        },
        fetcher,
      ),
      'GitHub repositories',
    );

    for (const value of entries) {
      collectRepository(value, username, repositories);
    }

    if (entries.length < 100) {
      break;
    }
  }

  const published = [
    ...repositories.values(),
  ];

  return {
    username: login,
    metrics: {
      followers: integer(user.followers),
      repositories: integer(user.public_repos),
      stars: published.reduce((sum, item): number => {
        return sum + item.stars;
      }, 0),
      forks: published.reduce((sum, item): number => {
        return sum + item.forks;
      }, 0),
    },
  };
}

function collectRepository(
  value: unknown,
  username: string,
  repositories: Map<
    number,
    {
      stars: number;
      forks: number;
    }
  >,
): void {
  const repository = record(value, 'GitHub repository');

  const id = integer(repository.id);

  if (repository.private !== false || !id) {
    throw new Error('Repository response is not explicitly public');
  }

  const owner = requiredText(
    record(repository.owner, 'GitHub repository owner').login,
    'GitHub repository owner login',
  );

  if (owner.toLowerCase() !== username.toLowerCase()) {
    throw new Error('Repository belongs to another account');
  }

  repositories.set(id, {
    stars: integer(repository.stargazers_count),
    forks: integer(repository.forks_count),
  });
}

function countFor(entries: unknown[], difficulty: string): number {
  const items = entries.map((entry): Record<string, unknown> => {
    return record(entry, 'LeetCode count');
  });

  return integer(
    items.find((item): boolean => {
      return item.difficulty === difficulty;
    })?.count,
  );
}

export async function collectLeetCode(
  entry: Pick<LinkRecord, 'url'>,
  fetcher: StatisticsFetcher = fetch,
): Promise<CollectedStats> {
  const url = new URL(requiredText(entry.url, 'LeetCode profile URL'));

  const parts = url.pathname.split('/')
    .filter(Boolean);

  const username = parts[1];

  if (
    url.hostname !== 'leetcode.com' ||
    parts[0] !== 'u' ||
    parts.length !== 2 ||
    !username
  ) {
    throw new Error('LeetCode statistics require a profile URL');
  }

  const result = record(
    await request(
      'https://leetcode.com/graphql/',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Referer: 'https://leetcode.com/',
        },
        body: JSON.stringify({
          query:
            'query($username: String!) { matchedUser(username: $username) { username profile { ranking } submitStatsGlobal { acSubmissionNum { difficulty count } } } allQuestionsCount { difficulty count } }',
          variables: {
            username,
          },
        }),
      },
      fetcher,
    ),
    'LeetCode result',
  );

  const data = record(result.data, 'LeetCode data');

  const user = record(data.matchedUser, 'LeetCode user');

  const login = requiredText(user.username, 'LeetCode username');

  if (
    (Array.isArray(result.errors) && result.errors.length) ||
    login.toLowerCase() !== username.toLowerCase()
  ) {
    throw new Error('LeetCode returned an invalid profile');
  }

  const solved = array(
    record(user.submitStatsGlobal, 'LeetCode submissions').acSubmissionNum,
    'LeetCode solved counts',
  );

  const totals = array(data.allQuestionsCount, 'LeetCode question counts');

  const metrics: Record<string, number> = {
    ranking: integer(record(user.profile, 'LeetCode profile').ranking),
  };

  const available: Record<string, number> = {};

  for (const difficulty of [
    'All',
    'Easy',
    'Medium',
    'Hard',
  ]) {
    let key = difficulty.toLowerCase();

    if (difficulty === 'All') {
      key = 'solved';
    }

    const count = countFor(solved, difficulty);

    const total = countFor(totals, difficulty);

    if (count > total) {
      throw new Error('Solved count exceeds total');
    }

    metrics[key] = count;
    available[key] = total;
  }

  if (
    countFor(solved, 'Easy') +
      countFor(solved, 'Medium') +
      countFor(solved, 'Hard') !==
    countFor(solved, 'All')
  ) {
    throw new Error('LeetCode difficulty counts do not add up');
  }

  return {
    username: login,
    metrics,
    available,
  };
}

export async function updateStats({
  configurationPath = resolve(root, 'website/src/data/links.yaml'),
  outputPath = resolve(root, 'website/src/data/statistics.yaml'),
  fetcher = fetch,
  now = (): Date => {
    return new Date();
  },
}: {
  configurationPath?: string;
  outputPath?: string;
  fetcher?: StatisticsFetcher;
  now?: () => Date;
} = {}): Promise<CollectionResult[]> {
  const configuration = readConfiguration(configurationPath);

  let previousText = '';

  try {
    previousText = await readFile(outputPath, 'utf8');
  } catch (error) {
    if (
      !(error instanceof Error) ||
      !('code' in error) ||
      error.code !== 'ENOENT'
    ) {
      throw error;
    }
  }

  let previous: Record<string, StatisticsSnapshot> = {};

  if (previousText) {
    previous = validateStatistics(parse(previousText) as unknown);
  }

  const next = {
    ...previous,
  };

  const providers: Record<
    string,
    (entry: LinkRecord, fetcher: StatisticsFetcher) => Promise<CollectedStats>
  > = {
    github: collectGitHub,
    leetcode: collectLeetCode,
  };

  const results: CollectionResult[] = [];

  const entries = configuration.sections
    .filter((section): boolean => {
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

  const ids = new Set<string>();

  for (const entry of entries) {
    await updateStatistic(
      entry,
      providers,
      ids,
      fetcher,
      now,
      next,
      results,
      previous,
    );
  }

  if (
    results.some((entry): boolean => {
      return entry.status === 'updated';
    })
  ) {
    await mkdir(dirname(outputPath), {
      recursive: true,
    });

    const temporary = `${outputPath}.${process.pid}.tmp`;

    await writeFile(temporary, stringify(next), {
      mode: 0o644,
    });
    await rename(temporary, outputPath);
  }

  return results;
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  console.log(JSON.stringify(await updateStats()));
}

async function updateStatistic(
  entry: LinkRecord,
  providers: Record<
    string,
    (entry: LinkRecord, fetcher: StatisticsFetcher) => Promise<CollectedStats>
  >,
  ids: Set<string>,
  fetcher: StatisticsFetcher,
  now: () => Date,
  next: Record<string, StatisticsSnapshot>,
  results: CollectionResult[],
  previous: Record<string, StatisticsSnapshot>,
): Promise<void> {
  const stats = entry.stats;

  const provider = providers[stats?.provider || ''];

  if (
    !entry.id ||
    ids.has(entry.id) ||
    !stats ||
    !provider ||
    !stats.metrics.length
  ) {
    throw new Error('Invalid statistics provider configuration');
  }

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
    const cached =
      previous[entry.id]?.profile_url === entry.url &&
      previous[entry.id]?.provider === stats.provider;

    let status: 'cached' | 'unavailable' = 'unavailable';

    if (cached) {
      status = 'cached';
    }

    results.push({
      id: entry.id,
      status,
      reason: String(error),
    });
  }
}
