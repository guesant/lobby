import type {
  DisplayLinkRecord,
  SectionRecord,
  SiteData,
} from '../content/content.types.ts';
import { optionalProperty } from '../content/object-fields.model.ts';
import { localizedText, textOr } from '../content/text.model.ts';
import * as configuration from '../navigation/routes.model.ts';

export function sectionLinks(
  data: SiteData,
  section: SectionRecord,
  locale: string,
): DisplayLinkRecord[] {
  return configuration
    .linksForSection(data.links, section)
    .map((item): DisplayLinkRecord => {
      return displayLink(data, item, locale);
    });
}

type ConfiguredLink = ReturnType<typeof configuration.linksForSection>[number];

function localizedVisual(
  visual: ConfiguredLink['visual'],
  locale: string,
): DisplayLinkRecord['visual'] {
  if (!visual) {
    return undefined;
  }

  return {
    ...visual,
    alt: localizedText(visual.alt, locale),
  };
}

function metricPresentation(
  data: SiteData,
  snapshot: SiteData['statistics'][string],
  identity: {
    id: string;
    locale: string;
  },
): NonNullable<
  NonNullable<DisplayLinkRecord['statistics']>['metrics']
>[number] {
  const metric = data.links.statistics.metrics[identity.id];

  if (!metric) {
    throw new Error(`Unknown metric: ${identity.id}`);
  }

  return {
    id: identity.id,
    label: localizedText(metric.labels, identity.locale, identity.id),
    icon: metric.icon,
    value: String(snapshot.metrics[identity.id]),
    ...optionalProperty('total', snapshot.available?.[identity.id]),
  };
}

function linkStatistics(
  data: SiteData,
  item: ConfiguredLink,
  locale: string,
): DisplayLinkRecord['statistics'] {
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

  return {
    updatedLabel: localizedText(data.links.statistics.updated, locale),
    updatedAt: new Date(snapshot.updated_at)
      .toISOString()
      .slice(0, 10),
    metrics: item.stats.metrics.map(
      (id): ReturnType<typeof metricPresentation> => {
        return metricPresentation(data, snapshot, {
          id,
          locale,
        });
      },
    ),
  };
}

function displayLink(
  data: SiteData,
  item: ConfiguredLink,
  locale: string,
): DisplayLinkRecord {
  const {
    visual,
    ...baseItem
  } = item;

  const labels = item.labels[locale] ?? item.labels['en'];

  if (!labels) {
    throw new Error(`Missing link labels: ${item.id}`);
  }

  const url = textOr(
    textOr(
      textOr(item.localized_urls?.[locale], item.localized_urls?.['en']),
      item.url,
    ),
    Object.values(item.localized_urls ?? {})[0],
  );

  if (!url) {
    throw new Error(`Missing link destination: ${item.id}`);
  }

  const statistics = linkStatistics(data, item, locale);

  const displayVisual = localizedVisual(visual, locale);

  return {
    ...baseItem,
    title: labels.title,
    url,
    language: locale,
    ...optionalProperty('description', labels.description),
    ...optionalProperty('badge', labels.badge),
    ...optionalProperty('visual', displayVisual),
    ...optionalProperty('statistics', statistics),
  };
}
