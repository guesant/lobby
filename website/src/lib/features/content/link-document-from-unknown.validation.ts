import type { LinkDocument, SectionRecord } from './content.types.ts';
import { defaultLanguage } from './default-language.validation.ts';
import { validateLinks } from './links.validation.ts';
import {
  languageOptions,
  localesFromUnknown,
  personalUpdates,
} from './locales.validation.ts';
import { sectionFromUnknown } from './section-from-unknown.validation.ts';
import {
  audiencesFromUnknown,
  homeConfiguration,
  navigationFromUnknown,
  profileFromUnknown,
  siteFromUnknown,
  statisticsConfiguration,
  themeFromUnknown,
} from './site-settings.validation.ts';
import { array, record, strings } from './validation.model.ts';

export function linkDocumentFromUnknown(value: unknown): LinkDocument {
  const source = record(value, 'links data');

  const options = languageOptions(source['language_options']);

  const languages = new Set<string>();

  for (const language of options) {
    languages.add(language.id);
  }

  const selectedDefaultLanguage = defaultLanguage(source, languages);

  const sections: SectionRecord[] = [];

  for (const [
    index,
    section,
  ] of array(source['sections'], 'links.sections')
      .entries()) {
    const parsedSection = sectionFromUnknown(section, index, languages);

    sections.push(parsedSection);
  }

  const document: LinkDocument = {
    profile: profileFromUnknown(source['profile']),
    theme: themeFromUnknown(source['theme']),
    language_options: options,
    sections,
    quick_contacts: strings(source['quick_contacts'], 'links.quick_contacts'),
    site: siteFromUnknown(source['site']),
    statistics: statisticsConfiguration(source['statistics']),
    locales: localesFromUnknown(source['locales'], languages),
    now: personalUpdates(source['now']),
    language_preference: {
      default: selectedDefaultLanguage,
    },
    navigation: navigationFromUnknown(source['navigation']),
    home: homeConfiguration(source['home']),
    audiences: audiencesFromUnknown(source['audiences']),
  };

  validateLinks(document);

  return document;
}
