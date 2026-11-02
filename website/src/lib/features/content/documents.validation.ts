import type {
  LinkDocument,
  LinkRecord,
  SectionRecord,
  SiteData,
} from './content.types.ts';
import { validateCredits } from './credits.validation.ts';
import { validateEditorial } from './editorial.validation.ts';
import { validateFederation } from './federation.validation.ts';
import {
  linkFromUnknown,
  optionalStrings,
  publicationFlags,
  sectionLabels,
} from './link-fields.validation.ts';
import { validateLinks } from './links.validation.ts';
import {
  languageOptions,
  localesFromUnknown,
  personalUpdates,
} from './locales.validation.ts';
import { optionalProperty } from './object-fields.model.ts';
import {
  audiencesFromUnknown,
  homeConfiguration,
  navigationFromUnknown,
  profileFromUnknown,
  siteFromUnknown,
  statisticsConfiguration,
  themeFromUnknown,
} from './site-settings.validation.ts';
import { validateStatistics } from './statistics.validation.ts';
import {
  array,
  optionalBoolean,
  optionalString,
  record,
  requiredText,
  strings,
} from './validation.model.ts';

function sectionFromUnknown(
  value: unknown,
  index: number,
  languages: Set<string>,
): SectionRecord {
  const label = `links.sections[${String(index)}]`;

  const source = record(value, label);

  const links = array(source['links'] ?? [], `${label}.links`)
    .map(
      (item, linkIndex): LinkRecord => {
        return linkFromUnknown(
          item,
          `${label}.links[${String(linkIndex)}]`,
          languages,
        );
      },
    );

  return {
    id: requiredText(source['id'], `${label}.id`),
    icon: optionalString(source['icon'], `${label}.icon`) ?? 'book',
    labels: sectionLabels(source['labels'], `${label}.labels`, languages),
    links,
    ...optionalProperty(
      'link_refs',
      optionalStrings(source['link_refs'], `${label}.link_refs`),
    ),
    ...optionalProperty(
      'editorial',
      optionalBoolean(source['editorial'], `${label}.editorial`),
    ),
    ...publicationFlags(source, label),
  };
}

export function linkDocumentFromUnknown(value: unknown): LinkDocument {
  const source = record(value, 'links data');

  const options = languageOptions(source['language_options']);

  const languages = new Set(
    options.map((language): string => {
      return language.id;
    }),
  );

  const preference = record(
    source['language_preference'],
    'links.language_preference',
  );

  const defaultLanguage = requiredText(
    preference['default'],
    'links.language_preference.default',
  );

  if (!languages.has(defaultLanguage)) {
    throw new Error('Invalid links.language_preference.default');
  }

  const document: LinkDocument = {
    profile: profileFromUnknown(source['profile']),
    theme: themeFromUnknown(source['theme']),
    language_options: options,
    sections: array(source['sections'], 'links.sections')
      .map(
        (section, index): SectionRecord => {
          return sectionFromUnknown(section, index, languages);
        },
      ),
    quick_contacts: strings(source['quick_contacts'], 'links.quick_contacts'),
    site: siteFromUnknown(source['site']),
    statistics: statisticsConfiguration(source['statistics']),
    locales: localesFromUnknown(source['locales'], languages),
    now: personalUpdates(source['now']),
    language_preference: {
      default: defaultLanguage,
    },
    navigation: navigationFromUnknown(source['navigation']),
    home: homeConfiguration(source['home']),
    audiences: audiencesFromUnknown(source['audiences']),
  };

  validateLinks(document);

  return document;
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
