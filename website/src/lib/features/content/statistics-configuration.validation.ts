import type { LinkDocument } from './content.types.ts';
import { record, requiredText, validateTextMap } from './validation.model.ts';

export function statisticsConfiguration(
  value: unknown,
): LinkDocument['statistics'] {
  const statistics = record(value, 'links.statistics');

  const definitions = record(statistics['metrics'], 'links.statistics.metrics');

  const metrics: LinkDocument['statistics']['metrics'] = {};

  for (const [
    id,
    raw,
  ] of Object.entries(definitions)) {
    const label = `links.statistics.metrics.${id}`;

    const metric = record(raw, label);

    metrics[id] = {
      icon: requiredText(metric['icon'], `${label}.icon`),
      labels: validateTextMap(metric['labels'], `${label}.labels`),
    };
  }

  return {
    updated: validateTextMap(statistics['updated'], 'links.statistics.updated'),
    unavailable: validateTextMap(
      statistics['unavailable'],
      'links.statistics.unavailable',
    ),
    metrics,
  };
}
