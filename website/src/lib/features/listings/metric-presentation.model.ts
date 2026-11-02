import type { DisplayLinkRecord, SiteData } from '../content/content.types.ts';
import { localizedText } from '../content/localized-text.model.ts';
import { optionalProperty } from '../content/object-fields.model.ts';

type MetricPresentationContext = {
  data: SiteData;
  snapshot: SiteData['statistics'][string];
  id: string;
  locale: string;
};

export function metricPresentation(
  context: MetricPresentationContext,
): NonNullable<
  NonNullable<DisplayLinkRecord['statistics']>['metrics']
>[number] {
  const {
    data,
    snapshot,
    id,
    locale
  } = context;

  const metric = data.links.statistics.metrics[id];

  if (!metric) {
    throw new Error(`Unknown metric: ${id}`);
  }

  return {
    id,
    label: localizedText(metric.labels, locale, id),
    icon: metric.icon,
    value: String(snapshot.metrics[id]),
    ...optionalProperty('total', snapshot.available?.[id]),
  };
}
