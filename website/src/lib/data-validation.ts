import { validateLinks } from './link-contract.ts';
import { optionalProperty } from './object-fields.ts';
import type {
  LinkDocument,
  LinkRecord,
  SectionRecord,
  SiteData,
} from './site-data.ts';
import {
  validateCredits,
  validateEditorial,
  validateFederation,
  validateStatistics,
} from './content-validation.ts';
import {
  array,
  optionalBoolean,
  optionalString,
  record,
  requiredBoolean,
  requiredText,
  strings,
  validateTextMap,
} from './validation-primitives.ts';

function positiveInteger(value: unknown, label: string): number {
  if (!Number.isInteger(value) || Number(value) < 1) {
    throw new Error(`Invalid ${label}`);
  }

  return Number(value);
}

function validateNow(
  value: unknown,
  label: string,
): LinkDocument['now'][string] {
  const source = record(value, label);

  const seo = record(source.seo, `${label}.seo`);

  const sections = array(source.sections, `${label}.sections`)
    .map(
      (
        rawSection,
        index,
      ): {
        id: string;
        title: string;
        description: string;
      } => {
        const itemLabel = `${label}.sections[${index}]`;

        const section = record(rawSection, itemLabel);

        return {
          id: requiredText(section.id, `${itemLabel}.id`),
          title: requiredText(section.title, `${itemLabel}.title`),
          description: requiredText(
            section.description,
            `${itemLabel}.description`,
          ),
        };
      },
    );

  return {
    seo: {
      title: requiredText(seo.title, `${label}.seo.title`),
      description: requiredText(seo.description, `${label}.seo.description`),
    },
    title: requiredText(source.title, `${label}.title`),
    intro: requiredText(source.intro, `${label}.intro`),
    sections,
  };
}

function localizedLinkLabels(
  value: unknown,
  label: string,
  languages: Set<string>,
): NonNullable<LinkRecord['labels']> {
  const source = record(value, label);

  const labels: NonNullable<LinkRecord['labels']> = {};

  for (const language of languages) {
    const raw = record(source[language], `${label}.${language}`);

    const description = optionalString(
      raw.description,
      `${label}.${language}.description`,
    );

    const badge = optionalString(raw.badge, `${label}.${language}.badge`);

    labels[language] = {
      title: requiredText(raw.title, `${label}.${language}.title`),
      ...optionalProperty('description', description),
      ...optionalProperty('badge', badge),
    };
  }

  return labels;
}

function linkFromUnknown(
  value: unknown,
  label: string,
  languages: Set<string>,
): LinkRecord {
  const source = record(value, label);

  const url = optionalString(source.url, `${label}.url`);

  const localizedURLs: Record<string, string> = {};

  if (source.localized_urls !== undefined) {
    const rawURLs = record(source.localized_urls, `${label}.localized_urls`);

    for (const [
      language,
      rawURL,
    ] of Object.entries(rawURLs)) {
      if (!languages.has(language)) {
        throw new Error(`Unknown localized URL language: ${language}`);
      }

      localizedURLs[language] = requiredText(
        rawURL,
        `${label}.localized_urls.${language}`,
      );
    }
  }

  if (!url && !Object.keys(localizedURLs).length) {
    throw new Error(`Missing destination at ${label}`);
  }

  const resolveAudiences = (): string[] | undefined => {
    if (source.audiences === undefined) {
      return undefined;
    }

    return strings(source.audiences, `${label}.audiences`);
  };

  const audiences = resolveAudiences();

  const flags = {
    enabled: optionalBoolean(source.enabled, `${label}.enabled`),
    public: optionalBoolean(source.public, `${label}.public`),
    private: optionalBoolean(source.private, `${label}.private`),
    draft: optionalBoolean(source.draft, `${label}.draft`),
    featured: optionalBoolean(source.featured, `${label}.featured`),
  };

  const title = optionalString(source.title, `${label}.title`);

  const description = optionalString(
    source.description,
    `${label}.description`,
  );

  const badge = optionalString(source.badge, `${label}.badge`);

  const target = optionalString(source.target, `${label}.target`);

  let stats: LinkRecord['stats'];

  if (source.stats !== undefined) {
    const rawStats = record(source.stats, `${label}.stats`);

    stats = {
      provider: requiredText(rawStats.provider, `${label}.stats.provider`),
      metrics: strings(rawStats.metrics, `${label}.stats.metrics`),
    };
  }

  let visual: LinkRecord['visual'];

  if (source.visual !== undefined) {
    const rawVisual = record(source.visual, `${label}.visual`);

    visual = {
      src: requiredText(rawVisual.src, `${label}.visual.src`),
      alt: validateTextMap(rawVisual.alt, `${label}.visual.alt`),
      kind: requiredText(rawVisual.kind, `${label}.visual.kind`),
      width: positiveInteger(rawVisual.width, `${label}.visual.width`),
      height: positiveInteger(rawVisual.height, `${label}.visual.height`),
    };
  }

  const localizedURLFields = ():
    | {
      localized_urls: Record<string, string>;
    }
    | {
      localized_urls?: never;
    } => {
    if (Object.keys(localizedURLs).length) {
      return {
        localized_urls: localizedURLs,
      };
    }

    return {};
  };

  return {
    id: requiredText(source.id, `${label}.id`),
    ...optionalProperty('url', url),
    ...localizedURLFields(),
    icon: requiredText(source.icon, `${label}.icon`),
    labels: localizedLinkLabels(source.labels, `${label}.labels`, languages),
    ...optionalProperty('title', title),
    ...optionalProperty('description', description),
    ...optionalProperty('badge', badge),
    ...optionalProperty('target', target),
    ...optionalProperty('audiences', audiences),
    ...optionalProperty('stats', stats),
    ...optionalProperty('visual', visual),
    ...optionalProperty('enabled', flags.enabled),
    ...optionalProperty('public', flags.public),
    ...optionalProperty('private', flags.private),
    ...optionalProperty('draft', flags.draft),
    ...optionalProperty('featured', flags.featured),
  };
}

function sectionFromUnknown(
  value: unknown,
  index: number,
  languages: Set<string>,
): SectionRecord {
  const label = `links.sections[${index}]`;

  const source = record(value, label);

  const links = array(source.links ?? [], `${label}.links`)
    .map(
      (item, linkIndex): LinkRecord => {
        return linkFromUnknown(item, `${label}.links[${linkIndex}]`, languages);
      },
    );

  const resolveSectionReferences = (): string[] | undefined => {
    if (source.link_refs === undefined) {
      return undefined;
    }

    return strings(source.link_refs, `${label}.link_refs`);
  };

  const refs = resolveSectionReferences();

  const enabled = optionalBoolean(source.enabled, `${label}.enabled`);

  const isPublic = optionalBoolean(source.public, `${label}.public`);

  const editorial = optionalBoolean(source.editorial, `${label}.editorial`);

  const isPrivate = optionalBoolean(source.private, `${label}.private`);

  const draft = optionalBoolean(source.draft, `${label}.draft`);

  const icon = optionalString(source.icon, `${label}.icon`) || 'book';

  const labels: SectionRecord['labels'] = {};

  const rawLabels = record(source.labels, `${label}.labels`);

  for (const language of languages) {
    const localized = record(
      rawLabels[language],
      `${label}.labels.${language}`,
    );

    labels[language] = {
      title: requiredText(localized.title, `${label}.labels.${language}.title`),
      description: requiredText(
        localized.description,
        `${label}.labels.${language}.description`,
      ),
    };
  }

  return {
    id: requiredText(source.id, `${label}.id`),
    icon,
    labels,
    links,
    ...optionalProperty('link_refs', refs),
    ...optionalProperty('editorial', editorial),
    ...optionalProperty('draft', draft),
    ...optionalProperty('private', isPrivate),
    ...optionalProperty('enabled', enabled),
    ...optionalProperty('public', isPublic),
  };
}

export function linkDocumentFromUnknown(value: unknown): LinkDocument {
  validateLinks(value);

  const source = record(value, 'links data');

  const languageOptions = array(
    source.language_options,
    'links.language_options',
  )
    .map(
      (
        item,
        index,
      ): {
        id: string;
        path: string;
        label: string;
        hreflang: string;
      } => {
        const label = `links.language_options[${index}]`;

        const language = record(item, label);

        return {
          id: requiredText(language.id, `${label}.id`),
          path: requiredText(language.path, `${label}.path`),
          label: requiredText(language.label, `${label}.label`),
          hreflang: requiredText(language.hreflang, `${label}.hreflang`),
        };
      },
    );

  const languages = new Set(
    languageOptions.map(({
      id
    }): string => {
      return id;
    }),
  );

  const rawProfile = record(source.profile, 'links.profile');

  const rawTheme = record(source.theme, 'links.theme');

  const rawSite = record(source.site, 'links.site');

  const rawPreference = record(
    source.language_preference,
    'links.language_preference',
  );

  const rawNavigation = record(source.navigation, 'links.navigation');

  const rawHomeNavigation = record(rawNavigation.home, 'links.navigation.home');

  const defaultLanguage = requiredText(
    rawPreference.default,
    'links.language_preference.default',
  );

  if (!languages.has(defaultLanguage)) {
    throw new Error('Invalid links.language_preference.default');
  }

  const sections = array(source.sections, 'links.sections')
    .map(
      (section, index): SectionRecord => {
        return sectionFromUnknown(section, index, languages);
      },
    );

  const languageStatistics = record(source.statistics, 'links.statistics');

  const rawMetricDefinitions = record(
    languageStatistics.metrics,
    'links.statistics.metrics',
  );

  const metrics: LinkDocument['statistics']['metrics'] = {};

  for (const [
    id,
    rawMetric,
  ] of Object.entries(rawMetricDefinitions)) {
    const metric = record(rawMetric, `links.statistics.metrics.${id}`);

    metrics[id] = {
      icon: requiredText(metric.icon, `links.statistics.metrics.${id}.icon`),
      labels: validateTextMap(
        metric.labels,
        `links.statistics.metrics.${id}.labels`,
      ),
    };
  }

  const rawLocales = record(source.locales, 'links.locales');

  const locales: LinkDocument['locales'] = {};

  for (const language of languages) {
    const label = `links.locales.${language}`;

    const locale = record(rawLocales[language], label);

    const seo = record(locale.seo, `${label}.seo`);

    const profile = record(locale.profile, `${label}.profile`);

    const presentation = record(locale.presentation, `${label}.presentation`);

    const ui = validateTextMap(locale.ui, `${label}.ui`);

    const facts = array(presentation.facts, `${label}.presentation.facts`)
      .map(
        (
          fact,
          index,
        ): {
          icon: string;
          text: string;
        } => {
          const itemLabel = `${label}.presentation.facts[${index}]`;

          const item = record(fact, itemLabel);

          return {
            icon: requiredText(item.icon, `${itemLabel}.icon`),
            text: requiredText(item.text, `${itemLabel}.text`),
          };
        },
      );

    locales[language] = {
      seo: {
        title: requiredText(seo.title, `${label}.seo.title`),
        description: requiredText(seo.description, `${label}.seo.description`),
      },
      profile: {
        bio: requiredText(profile.bio, `${label}.profile.bio`),
      },
      ui: {
        ...ui,
        third_party: requiredText(ui.third_party, `${label}.ui.third_party`),
        html_lang: requiredText(ui.html_lang, `${label}.ui.html_lang`),
      },
      presentation: {
        title: requiredText(presentation.title, `${label}.presentation.title`),
        facts,
        site_title: requiredText(
          presentation.site_title,
          `${label}.presentation.site_title`,
        ),
        topics: strings(presentation.topics, `${label}.presentation.topics`),
      },
    };
  }

  const rawNow = record(source.now, 'links.now');

  const now: LinkDocument['now'] = {};

  for (const [
    language,
    content,
  ] of Object.entries(rawNow)) {
    now[language] = validateNow(content, `links.now.${language}`);
  }

  const rawAudiences = array(source.audiences, 'links.audiences')
    .map(
      (
        value,
        index,
      ): {
        id: string;
        labels: Record<string, string>;
      } => {
        const label = `links.audiences[${index}]`;

        const audience = record(value, label);

        return {
          id: requiredText(audience.id, `${label}.id`),
          labels: validateTextMap(audience.labels, `${label}.labels`),
        };
      },
    );

  const rawHome = record(source.home, 'links.home');

  const navigationSections = strings(
    rawNavigation.sections,
    'links.navigation.sections',
  );

  const navigationLinks = strings(
    rawNavigation.links,
    'links.navigation.links',
  );

  const statistics = {
    updated: validateTextMap(
      languageStatistics.updated,
      'links.statistics.updated',
    ),
    unavailable: validateTextMap(
      languageStatistics.unavailable,
      'links.statistics.unavailable',
    ),
    metrics,
  };

  return {
    profile: {
      name: requiredText(rawProfile.name, 'links.profile.name'),
      username: requiredText(rawProfile.username, 'links.profile.username'),
      avatar: optionalString(rawProfile.avatar, 'links.profile.avatar') ?? '',
      birth_date: requiredText(
        rawProfile.birth_date,
        'links.profile.birth_date',
      ),
      same_as_links: strings(
        rawProfile.same_as_links,
        'links.profile.same_as_links',
      ),
    },
    theme: {
      preset: requiredText(rawTheme.preset, 'links.theme.preset'),
      appearance: requiredText(rawTheme.appearance, 'links.theme.appearance'),
      background: requiredText(rawTheme.background, 'links.theme.background'),
      animations_enabled: requiredBoolean(
        rawTheme.animations_enabled,
        'links.theme.animations_enabled',
      ),
    },
    language_options: languageOptions,
    sections,
    quick_contacts: strings(source.quick_contacts, 'links.quick_contacts'),
    site: {
      repository: requiredText(rawSite.repository, 'links.site.repository'),
      repository_label: requiredText(
        rawSite.repository_label,
        'links.site.repository_label',
      ),
      first_party_domains: strings(
        rawSite.first_party_domains,
        'links.site.first_party_domains',
      ),
    },
    statistics,
    locales,
    now,
    language_preference: {
      default: defaultLanguage,
    },
    navigation: {
      sections: navigationSections,
      links: navigationLinks,
      home: {
        icon: requiredText(
          rawHomeNavigation.icon,
          'links.navigation.home.icon',
        ),
        labels: validateTextMap(
          rawHomeNavigation.labels,
          'links.navigation.home.labels',
        ),
      },
      labels: validateTextMap(rawNavigation.labels, 'links.navigation.labels'),
    },
    home: {
      illustration_enabled: requiredBoolean(
        rawHome.illustration_enabled,
        'links.home.illustration_enabled',
      ),
    },
    audiences: rawAudiences,
  };
}

export function validateSiteDocuments(input: {
  links: unknown;
  editorial: unknown;
  credits: unknown;
  statistics: unknown;
  federation: unknown;
}): SiteData {
  return {
    links: linkDocumentFromUnknown(input.links),
    editorial: validateEditorial(input.editorial),
    credits: validateCredits(input.credits),
    statistics: validateStatistics(input.statistics),
    federation: validateFederation(input.federation),
  };
}
