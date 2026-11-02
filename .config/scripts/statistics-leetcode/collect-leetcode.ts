import type { LinkRecord } from '../../../website/src/lib/features/content/content.types.ts';
import {
  array,
  record,
} from '../../../website/src/lib/features/content/validation.model.ts';
import type { CollectedStats, StatisticsFetcher } from '../statistics.types.ts';
import { integer } from '../statistics-request.ts';
import { difficultyMetrics } from './difficulty-metrics.ts';
import { leetcodeProfile } from './leetcode-profile.ts';
import { profileUsername } from './profile-username.ts';

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

  const submissions = record(user['submitStatsGlobal'], 'LeetCode submissions');

  const solved = array(
    submissions['acSubmissionNum'],
    'LeetCode solved counts',
  );

  const totals = array(data['allQuestionsCount'], 'LeetCode question counts');

  const profile = record(user['profile'], 'LeetCode profile');

  const ranking = integer(profile['ranking']);

  const metrics: Record<string, number> = {
    ranking,
  };

  return {
    username: login,
    metrics,
    available: difficultyMetrics(solved, totals, metrics),
  };
}
