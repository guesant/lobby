import { array } from '../../../website/src/lib/features/content/validation.model.ts';
import type { StatisticsFetcher } from '../statistics.types.ts';
import { request } from '../statistics-request.ts';
import { collectRepository } from './collect-repository.ts';

export async function githubRepositories(
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
  const encodedUsername = encodeURIComponent(username);

  const endpoint = `https://api.github.com/users/${encodedUsername}`;

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

    const pageNumber = String(page);

    const pageURL = `${endpoint}/repos?type=owner&per_page=100&page=${pageNumber}`;

    const response = await request(
      pageURL,
      {
        headers,
      },
      fetcher,
    );

    const entries = array(response, 'GitHub repositories');

    for (const entry of entries) {
      collectRepository(entry, username, repositories);
    }

    if (entries.length < 100) {
      break;
    }
  }

  return repositories;
}
