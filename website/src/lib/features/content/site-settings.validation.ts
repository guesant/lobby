import type { LinkDocument } from './content.types.ts';
import {
  array,
  optionalString,
  record,
  requiredBoolean,
  requiredText,
  strings,
  validateTextMap,
} from './validation.model.ts';

export function profileFromUnknown(value: unknown): LinkDocument['profile'] {
  const profile = record(value, 'links.profile');

  return {
    name: requiredText(profile['name'], 'links.profile.name'),
    username: requiredText(profile['username'], 'links.profile.username'),
    avatar: optionalString(profile['avatar'], 'links.profile.avatar') ?? '',
    birth_date: requiredText(profile['birth_date'], 'links.profile.birth_date'),
    same_as_links: strings(
      profile['same_as_links'],
      'links.profile.same_as_links',
    ),
  };
}

export function themeFromUnknown(value: unknown): LinkDocument['theme'] {
  const theme = record(value, 'links.theme');

  return {
    preset: requiredText(theme['preset'], 'links.theme.preset'),
    appearance: requiredText(theme['appearance'], 'links.theme.appearance'),
    background: requiredText(theme['background'], 'links.theme.background'),
    animations_enabled: requiredBoolean(
      theme['animations_enabled'],
      'links.theme.animations_enabled',
    ),
  };
}

export function siteFromUnknown(value: unknown): LinkDocument['site'] {
  const site = record(value, 'links.site');

  return {
    repository: requiredText(site['repository'], 'links.site.repository'),
    repository_label: requiredText(
      site['repository_label'],
      'links.site.repository_label',
    ),
    first_party_domains: strings(
      site['first_party_domains'],
      'links.site.first_party_domains',
    ),
  };
}

export function navigationFromUnknown(
  value: unknown,
): LinkDocument['navigation'] {
  const navigation = record(value, 'links.navigation');

  const home = record(navigation['home'], 'links.navigation.home');

  return {
    sections: strings(navigation['sections'], 'links.navigation.sections'),
    links: strings(navigation['links'], 'links.navigation.links'),
    home: {
      icon: requiredText(home['icon'], 'links.navigation.home.icon'),
      labels: validateTextMap(home['labels'], 'links.navigation.home.labels'),
    },
    labels: validateTextMap(navigation['labels'], 'links.navigation.labels'),
  };
}

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

export function audiencesFromUnknown(
  value: unknown,
): LinkDocument['audiences'] {
  return array(value, 'links.audiences')
    .map(
      (raw, index): LinkDocument['audiences'][number] => {
        const label = `links.audiences[${String(index)}]`;

        const audience = record(raw, label);

        return {
          id: requiredText(audience['id'], `${label}.id`),
          labels: validateTextMap(audience['labels'], `${label}.labels`),
        };
      },
    );
}

export function homeConfiguration(value: unknown): LinkDocument['home'] {
  const home = record(value, 'links.home');

  return {
    illustration_enabled: requiredBoolean(
      home['illustration_enabled'],
      'links.home.illustration_enabled',
    ),
  };
}
