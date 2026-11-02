import type { LinkDocument } from './content.types.ts';
import type { LinkCatalog } from './link-catalog.types.ts';
import { validateLinkLanguages } from './validate-link-languages.validation.ts';
import { validateLinkReferences } from './validate-link-references.validation.ts';
import { validateLinkSection } from './validate-link-section.validation.ts';
import { validateSectionReferences } from './validate-section-references.validation.ts';

export function validateLinks(document: LinkDocument): void {
  validateLinkLanguages(document);

  const catalog: LinkCatalog = {
    sections: new Set(),
    links: new Set(),
  };

  for (const section of document.sections) {
    validateLinkSection(section, catalog);
  }

  validateLinkReferences(
    document.quick_contacts,
    catalog.links,
    'quick contact link',
  );
  validateLinkReferences(
    document.navigation.sections,
    catalog.sections,
    'navigation section',
  );
  validateLinkReferences(
    document.navigation.links,
    catalog.links,
    'navigation link',
  );

  for (const section of document.sections) {
    validateSectionReferences(section, catalog.links);
  }
}
