import type {
  LinkDocument,
  LinkRecord,
  SectionRecord,
} from './content.types.ts';
import { requiredText } from './validation.model.ts';

type LinkCatalog = {
  sections: Set<string>;
  links: Set<string>;
};

function rememberID(id: string, seen: Set<string>, label: string): void {
  if (seen.has(id)) {
    throw new Error(`Duplicate ${label}: ${id}`);
  }

  seen.add(id);
}

function validateReferences(
  ids: string[],
  catalog: Set<string>,
  label: string,
): void {
  for (const id of ids) {
    if (!catalog.has(id)) {
      throw new Error(`Unknown ${label}: ${id}`);
    }
  }
}

function validateDestination(value: string, label: string): void {
  requiredText(value, label);

  if (/^\s*(javascript|data|vbscript):/i.test(value)) {
    throw new Error(`Invalid ${label}`);
  }
}

function validateLinkDestinations(link: LinkRecord): void {
  const label = `links.${link.id}`;

  if (link.url !== undefined) {
    validateDestination(link.url, `${label}.url`);
  }

  for (const [
    language,
    destination,
  ] of Object.entries(link.localized_urls ?? {})) {
    validateDestination(destination, `${label}.localized_urls.${language}`);
  }
}

function validateSection(section: SectionRecord, catalog: LinkCatalog): void {
  rememberID(section.id, catalog.sections, 'links.sections id');

  for (const link of section.links) {
    rememberID(link.id, catalog.links, 'links.sections link id');
    validateLinkDestinations(link);
  }
}

function validateSectionReferences(
  section: SectionRecord,
  linkIDs: Set<string>,
): void {
  const refs = section.link_refs ?? [];

  const own = section.links.map((link): string => {
    return link.id;
  });

  if (
    new Set([
      ...own,
      ...refs,
    ]).size !==
    own.length + refs.length
  ) {
    throw new Error(`Duplicate link in section ${section.id}`);
  }

  validateReferences(refs, linkIDs, 'link reference');
}

function validateLanguages(document: LinkDocument): void {
  const languages = document.language_options;

  if (!languages.length) {
    throw new Error('Invalid links.language_options: empty list');
  }

  const ids = new Set(
    languages.map((language): string => {
      return language.id;
    }),
  );

  if (ids.size !== languages.length) {
    throw new Error('Invalid links.language_options: duplicate language id');
  }

  if (!ids.has(document.language_preference.default)) {
    throw new Error('Invalid links.language_preference.default');
  }
}

export function validateLinks(document: LinkDocument): void {
  validateLanguages(document);

  const catalog: LinkCatalog = {
    sections: new Set(),
    links: new Set(),
  };

  for (const section of document.sections) {
    validateSection(section, catalog);
  }

  validateReferences(
    document.quick_contacts,
    catalog.links,
    'quick contact link',
  );
  validateReferences(
    document.navigation.sections,
    catalog.sections,
    'navigation section',
  );
  validateReferences(
    document.navigation.links,
    catalog.links,
    'navigation link',
  );

  for (const section of document.sections) {
    validateSectionReferences(section, catalog.links);
  }
}
