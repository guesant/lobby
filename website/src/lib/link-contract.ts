import type { UnknownRecord } from './validation-primitives.ts';
import {
  array,
  record,
  text,
  strings,
  requiredText,
} from './validation-primitives.ts';

export function validateLinks(value: unknown): void {
  const links = record(value, 'links data');

  const profile = record(links.profile, 'links.profile');

  text(profile.name, 'links.profile.name');
  text(profile.username, 'links.profile.username');
  text(profile.birth_date, 'links.profile.birth_date');
  strings(profile.same_as_links, 'links.profile.same_as_links');

  const site = record(links.site, 'links.site');

  text(site.repository, 'links.site.repository');
  strings(site.first_party_domains, 'links.site.first_party_domains');

  const preference = record(
    links.language_preference,
    'links.language_preference',
  );

  const navigation = record(links.navigation, 'links.navigation');

  const languageIDs = validateLanguages(links, preference);

  const navigationSections = strings(
    navigation.sections,
    'links.navigation.sections',
  );

  const navigationLinks = strings(navigation.links, 'links.navigation.links');

  record(navigation.home, 'links.navigation.home');

  const sections = array(links.sections, 'links.sections');

  const sectionIDs = new Set<string>();

  const linkIDs = new Set<string>();

  for (const [
    index,
    entry,
  ] of sections.entries()) {
    validateLinkSection(entry, index, sectionIDs, linkIDs, languageIDs);
  }

  const quickContacts = strings(links.quick_contacts, 'links.quick_contacts');

  for (const id of quickContacts) {
    if (!linkIDs.has(id)) {
      throw new Error(`Unknown quick contact link: ${id}`);
    }
  }

  for (const id of navigationSections) {
    if (!sectionIDs.has(id)) {
      throw new Error(`Unknown navigation section: ${id}`);
    }
  }

  for (const id of navigationLinks) {
    if (!linkIDs.has(id)) {
      throw new Error(`Unknown navigation link: ${id}`);
    }
  }

  for (const [
    index,
    entry,
  ] of sections.entries()) {
    validateSectionReferences(entry, index, linkIDs);
  }
}

function validateSectionReferences(
  entry: unknown,
  index: number,
  linkIDs: Set<string>,
): void {
  const section = record(entry, `links.sections[${index}]`);

  const resolveRefs = (): string[] => {
    if (section.link_refs) {
      return strings(section.link_refs, `links.sections[${index}].link_refs`);
    }

    return [];
  };

  const refs = resolveRefs();

  const ownLinks = array(
    section.links || [],
    `links.sections[${index}].links`,
  )
    .map((link, linkIndex): string => {
      return requiredText(
        record(link, `links.sections[${index}].links[${linkIndex}]`).id,
        `links.sections[${index}].links[${linkIndex}].id`,
      );
    });

  if (
    new Set([
      ...ownLinks,
      ...refs,
    ]).size !==
    ownLinks.length + refs.length
  ) {
    throw new Error(`Duplicate link in section ${section.id}`);
  }

  for (const id of refs) {
    if (!linkIDs.has(id)) {
      throw new Error(`Unknown link reference: ${id}`);
    }
  }
}

function validateLanguages(
  links: UnknownRecord,
  preference: UnknownRecord,
): Set<string> {
  const languages = array(links.language_options, 'links.language_options');

  if (!languages.length) {
    throw new Error('Invalid links.language_options: empty list');
  }

  for (const [
    index,
    entry,
  ] of languages.entries()) {
    const language = record(entry, `links.language_options[${index}]`);

    text(language.id, `links.language_options[${index}].id`);
    text(language.path, `links.language_options[${index}].path`);
  }

  const languageIDs = new Set(
    languages.map((entry, index): string => {
      return requiredText(
        record(entry, `links.language_options[${index}]`).id,
        `links.language_options[${index}].id`,
      );
    }),
  );

  if (languageIDs.size !== languages.length) {
    throw new Error('Invalid links.language_options: duplicate language id');
  }

  text(preference.default, 'links.language_preference.default');

  if (!languageIDs.has(preference.default)) {
    throw new Error('Invalid links.language_preference.default');
  }

  const localized = record(links.locales, 'links.locales');

  for (const id of languageIDs) {
    const locale = record(localized[id], `links.locales.${id}`);

    record(locale.seo, `links.locales.${id}.seo`);
    record(locale.profile, `links.locales.${id}.profile`);
    record(locale.ui, `links.locales.${id}.ui`);
    record(locale.presentation, `links.locales.${id}.presentation`);
  }

  return languageIDs;
}

function validateLinkSection(
  entry: unknown,
  index: number,
  sectionIDs: Set<string>,
  linkIDs: Set<string>,
  languageIDs: Set<string>,
): void {
  const section = record(entry, `links.sections[${index}]`);

  text(section.id, `links.sections[${index}].id`);

  if (sectionIDs.has(section.id)) {
    throw new Error(`Duplicate links.sections id: ${section.id}`);
  }

  sectionIDs.add(section.id);

  for (const item of array(
    section.links || [],
    `links.sections[${index}].links`,
  )) {
    validateSectionLink(item, index, linkIDs, languageIDs);
  }

  if (section.link_refs !== undefined) {
    strings(section.link_refs, `links.sections[${index}].link_refs`);
  }

  const labels = record(section.labels, `links.sections[${index}].labels`);

  for (const language of languageIDs) {
    const localizedLabel = record(
      labels[language],
      `links.sections[${index}].labels.${language}`,
    );

    text(
      localizedLabel.title,
      `links.sections[${index}].labels.${language}.title`,
    );
    text(
      localizedLabel.description,
      `links.sections[${index}].labels.${language}.description`,
    );
  }
}

function validateSectionLink(
  item: unknown,
  index: number,
  linkIDs: Set<string>,
  languageIDs: Set<string>,
): void {
  const link = record(item, `links.sections[${index}].links[]`);

  text(link.id, `links.sections[${index}].links[].id`);

  if (linkIDs.has(link.id)) {
    throw new Error(`Duplicate links.sections link id: ${link.id}`);
  }

  linkIDs.add(link.id);

  validateLinkDestinations(link, index, languageIDs);

  for (const flag of [
    'enabled',
    'public',
    'private',
    'draft',
  ]) {
    if (link[flag] !== undefined && typeof link[flag] !== 'boolean') {
      throw new Error(`Invalid link visibility flag: ${flag}`);
    }
  }

  const labels = record(link.labels, `links.sections[${index}].links[].labels`);

  for (const language of languageIDs) {
    const localizedLabel = record(
      labels[language],
      `links.sections[${index}].links[].labels.${language}`,
    );

    text(
      localizedLabel.title,
      `links.sections[${index}].links[].labels.${language}.title`,
    );
  }
}

function validateLinkDestinations(
  link: UnknownRecord,
  index: number,
  languageIDs: Set<string>,
): void {
  if (link.url !== undefined) {
    text(link.url, `links.sections[${index}].links[].url`);

    if (/^\s*(javascript|data|vbscript):/i.test(link.url)) {
      throw new Error(`Invalid links.sections[${index}].links[].url`);
    }
  } else if (link.localized_urls === undefined) {
    throw new Error(`Missing destination at links.sections[${index}].links[]`);
  }

  if (link.localized_urls !== undefined) {
    const localizedURLs = record(
      link.localized_urls,
      `links.sections[${index}].links[].localized_urls`,
    );

    for (const [
      locale,
      destination,
    ] of Object.entries(localizedURLs)) {
      if (!languageIDs.has(locale)) {
        throw new Error(`Unknown localized URL language: ${locale}`);
      }

      text(
        destination,
        `links.sections[${index}].links[].localized_urls.${locale}`,
      );

      if (/^\s*(javascript|data|vbscript):/i.test(destination)) {
        throw new Error(
          `Invalid localized URL at links.sections[${index}].links[]`,
        );
      }
    }
  }
}
