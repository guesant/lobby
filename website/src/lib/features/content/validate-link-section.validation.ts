import type { SectionRecord } from './content.types.ts';
import type { LinkCatalog } from './link-catalog.types.ts';
import { rememberLinkID } from './remember-link-id.validation.ts';
import { validateLinkDestinations } from './validate-link-destinations.validation.ts';

export function validateLinkSection(
  section: SectionRecord,
  catalog: LinkCatalog,
): void {
  rememberLinkID(section.id, catalog.sections, 'links.sections id');

  for (const link of section.links) {
    rememberLinkID(link.id, catalog.links, 'links.sections link id');
    validateLinkDestinations(link);
  }
}
