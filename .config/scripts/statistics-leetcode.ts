import type { LinkRecord } from '../../website/src/lib/features/content/content.types.ts';
import {
  array,
  record,
  requiredText,
} from '../../website/src/lib/features/content/validation.model.ts';
import type { CollectedStats, StatisticsFetcher } from './statistics.types.ts';
import { integer, request } from './statistics-request.ts';

function countFor(entries: unknown[], difficulty: string): number {
  const items = entries.map((entry): Record<string, unknown> => {
    return record(entry, 'LeetCode count');
  });

  return integer(
    items.find((item): boolean => {
      return item['difficulty'] === difficulty;
    })?.['count'],
  );
}

function profileUsername(entry: Pick<LinkRecord, 'url'>): string {
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

  return username;
}

async function leetcodeProfile(
  username: string,
  fetcher: StatisticsFetcher,
): Promise<{
  data: Record<string, unknown>;
  user: Record<string, unknown>;
  login: string;
}> {
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

  const data = record(result['data'], 'LeetCode data');

  const user = record(data['matchedUser'], 'LeetCode user');

  const login = requiredText(user['username'], 'LeetCode username');

  if (
    (Array.isArray(result['errors']) && result['errors'].length) ||
    login.toLowerCase() !== username.toLowerCase()
  ) {
    throw new Error('LeetCode returned an invalid profile');
  }

  return {
    data,
    user,
    login,
  };
}

export async function collectLeetCode(
  entry: Pick<LinkRecord, 'url'>,
  fetcher: StatisticsFetcher = fetch,
): Promise<CollectedStats> {
  const username = profileUsername(entry);

  const {
    data,
    user,
    login
  } = await leetcodeProfile(username, fetcher);

  const solved = array(
    record(user['submitStatsGlobal'], 'LeetCode submissions')[
      'acSubmissionNum'
    ],
    'LeetCode solved counts',
  );

  const totals = array(data['allQuestionsCount'], 'LeetCode question counts');

  const metrics: Record<string, number> = {
    ranking: integer(record(user['profile'], 'LeetCode profile')['ranking']),
  };

  const available = difficultyMetrics(solved, totals, metrics);

  return {
    username: login,
    metrics,
    available,
  };
}

function difficultyMetrics(
  solved: unknown[],
  totals: unknown[],
  metrics: Record<string, number>,
): Record<string, number> {
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

  return available;
}
