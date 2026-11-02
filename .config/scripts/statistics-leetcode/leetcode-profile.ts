import {
  record,
  requiredText,
} from '../../../website/src/lib/features/content/validation.model.ts';
import type { StatisticsFetcher } from '../statistics.types.ts';
import { request } from '../statistics-request.ts';

export async function leetcodeProfile(
  username: string,
  fetcher: StatisticsFetcher,
): Promise<{
  data: Record<string, unknown>;
  user: Record<string, unknown>;
  login: string;
}> {
  const body = JSON.stringify({
    query:
      'query($username: String!) { matchedUser(username: $username) { username profile { ranking } submitStatsGlobal { acSubmissionNum { difficulty count } } } allQuestionsCount { difficulty count } }',
    variables: {
      username,
    },
  });

  const query = await request(
    'https://leetcode.com/graphql/',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Referer: 'https://leetcode.com/',
      },
      body,
    },
    fetcher,
  );

  const result = record(query, 'LeetCode result');

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
