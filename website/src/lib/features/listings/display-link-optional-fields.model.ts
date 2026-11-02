import type { DisplayLinkRecord, SiteData } from '../content/content.types.ts';
import { optionalProperty } from '../content/object-fields.model.ts';
import { linkStatistics } from './link-statistics.model.ts';
import type { ConfiguredLink } from './links.types.ts';
import { localizedLinkVisual } from './localized-link-visual.model.ts';

export function displayLinkOptionalFields(context: {
  data: SiteData;
  item: ConfiguredLink;
  locale: string;
  labels: ConfiguredLink['labels'][string];
  visual: ConfiguredLink['visual'];
}): Partial<
  Pick<DisplayLinkRecord, 'description' | 'badge' | 'visual' | 'statistics'>
> {
  const {
    data,
    item,
    locale,
    labels,
    visual
  } = context;

  const localizedVisual = localizedLinkVisual(visual, locale);

  const statistics = linkStatistics({
    data,
    item,
    locale,
  });

  const description = optionalProperty('description', labels.description);

  const badge = optionalProperty('badge', labels.badge);

  const visualProperty = optionalProperty('visual', localizedVisual);

  const statisticsProperty = optionalProperty('statistics', statistics);

  return {
    ...description,
    ...badge,
    ...visualProperty,
    ...statisticsProperty,
  };
}
