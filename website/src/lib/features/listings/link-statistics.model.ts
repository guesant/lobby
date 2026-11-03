import type { DisplayLinkRecord } from '../content/content.types.ts';
import { localizedText } from '../content/localized-text.model.ts';
import type { LinkStatisticsContext } from './link-statistics.types.ts';
import { metricPresentation } from './metric-presentation.model.ts';

export function linkStatistics(
  context: LinkStatisticsContext,
): DisplayLinkRecord['statistics'] {
  const {
    data,
    item,
    locale
  } = context;

  if (!item.stats) {
    return undefined;
  }

  const snapshot = data.statistics[item.id];

  if (
    !snapshot ||
    snapshot.profile_url !== item.url ||
    snapshot.provider !== item.stats.provider
  ) {
    return {
      unavailable: localizedText(data.links.statistics.unavailable, locale),
    };
  }

  const metrics = [];

  for (const id of item.stats.metrics) {
    const metric = metricPresentation({
      data,
      snapshot,
      id,
      locale,
    });

    metrics.push(metric);
  }

  const updatedAt = new Date(snapshot.updated_at);

  const updatedISOString = updatedAt.toISOString();

  const updatedDate = updatedISOString.slice(0, 10);

  return {
    updatedLabel: localizedText(data.links.statistics.updated, locale),
    updatedAt: updatedDate,
    metrics,
  };
}
