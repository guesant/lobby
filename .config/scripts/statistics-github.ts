import type { LinkRecord } from '../../website/src/lib/features/content/content.types.ts';
import {
  array,
  record,
  requiredText,
} from '../../website/src/lib/features/content/validation.model.ts';
import type { CollectedStats, StatisticsFetcher } from './statistics.types.ts';
import { integer, request } from './statistics-request.ts';

function profileUsername(entry: Pick<LinkRecord, 'url'>): string {
  const url = new URL(requiredText(entry.url, 'GitHub profile URL'));

  const parts = url.pathname.split('/')
    .filter(Boolean);

  const username = parts[0];

  if (url.hostname !== 'github.com' || parts.length !== 1 || !username) {
    throw new Error('GitHub statistics require a profile URL');
  }

  return username;
}

function githubHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2026-03-10',
  };

  if (process.env['GITHUB_STATS_TOKEN']) {
    headers['Authorization'] = `Bearer ${process.env['GITHUB_STATS_TOKEN']}`;
  }

  return headers;
}

export async function collectGitHub(
  entry: Pick<LinkRecord, 'url'>,
  fetcher: StatisticsFetcher = fetch,
): Promise<CollectedStats> {
  const username = profileUsername(entry);

  const headers = githubHeaders();

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

  const login = requiredText(user['login'], 'GitHub login');

  if (login.toLowerCase() !== username.toLowerCase()) {
    throw new Error('GitHub returned a different profile');
  }

  const repositories = await githubRepositories(username, headers, fetcher);

  const published = [
    ...repositories.values(),
  ];

  return {
    username: login,
    metrics: {
      followers: integer(user['followers']),
      repositories: integer(user['public_repos']),
      stars: published.reduce((sum, item): number => {
        return sum + item.stars;
      }, 0),
      forks: published.reduce((sum, item): number => {
        return sum + item.forks;
      }, 0),
    },
  };
}

async function githubRepositories(
  username: string,
  headers: Record<string, string>,
  fetcher: StatisticsFetcher,
): Promise<
  Map<
    number,
    {
      stars: number;
      forks: number;
    }
  >
> {
  const endpoint = `https://api.github.com/users/${encodeURIComponent(username)}`;

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
        `${endpoint}/repos?type=owner&per_page=100&page=${String(page)}`,
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

  return repositories;
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

  const id = integer(repository['id']);

  if (repository['private'] !== false || !id) {
    throw new Error('Repository response is not explicitly public');
  }

  const owner = requiredText(
    record(repository['owner'], 'GitHub repository owner')['login'],
    'GitHub repository owner login',
  );

  if (owner.toLowerCase() !== username.toLowerCase()) {
    throw new Error('Repository belongs to another account');
  }

  repositories.set(id, {
    stars: integer(repository['stargazers_count']),
    forks: integer(repository['forks_count']),
  });
}
