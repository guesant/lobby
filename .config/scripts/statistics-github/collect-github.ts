import type { LinkRecord } from '../../../website/src/lib/features/content/content.types.ts';
import {
  record,
  requiredText,
} from '../../../website/src/lib/features/content/validation.model.ts';
import type { CollectedStats, StatisticsFetcher } from '../statistics.types.ts';
import { integer } from '../statistics-request.ts';
import { request } from '../statistics-request.ts';
import { githubHeaders } from './github-headers.ts';
import { githubRepositories } from './github-repositories.ts';
import { profileUsername } from './profile-username.ts';
import { repositoryTotals } from './repository-totals.ts';

export async function collectGitHub(
  entry: Pick<LinkRecord, 'url'>,
  fetcher: StatisticsFetcher = fetch,
): Promise<CollectedStats> {
  const username = profileUsername(entry);

  const headers = githubHeaders();

  const encodedUsername = encodeURIComponent(username);

  const endpoint = `https://api.github.com/users/${encodedUsername}`;

  const profile = await request(
    endpoint,
    {
      headers,
    },
    fetcher,
  );

  const user = record(profile, 'GitHub profile');

  const login = requiredText(user['login'], 'GitHub login');

  if (login.toLowerCase() !== username.toLowerCase()) {
    throw new Error('GitHub returned a different profile');
  }

  const repositories = await githubRepositories(username, headers, fetcher);

  const totals = repositoryTotals(repositories);

  return {
    username: login,
    metrics: {
      followers: integer(user['followers']),
      repositories: integer(user['public_repos']),
      stars: totals.stars,
      forks: totals.forks,
    },
  };
}
