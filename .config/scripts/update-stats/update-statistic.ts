import type { StatisticsSnapshot } from '../../../website/src/lib/features/content/content.types.ts';
import { requiredText } from '../../../website/src/lib/features/content/validation.model.ts';
import { integer } from '../statistics-request.ts';
import { failureStatus } from './failure-status.ts';
import { statisticConfiguration } from './statistic-configuration.ts';
import type { StatisticsUpdateContext } from './update-stats.types.ts';

export async function updateStatistic(
  input: StatisticsUpdateContext,
): Promise<void> {
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
    const status = failureStatus(entry, previous, stats.provider);

    const reason = String(error);

    results.push({
      id: entry.id,
      status,
      reason,
    });
  }
}
