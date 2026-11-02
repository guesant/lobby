import type { SectionRecord } from './content.types.ts';
import { validateLinkReferences } from './validate-link-references.validation.ts';

export function validateSectionReferences(
  section: SectionRecord,
  linkIDs: Set<string>,
): void {
  const refs = section.link_refs ?? [];

  const own: string[] = [];

  for (const link of section.links) {
    own.push(link.id);
  }

  const all = new Set(own);

  for (const ref of refs) {
    all.add(ref);
  }

  if (all.size !== own.length + refs.length) {
    throw new Error(`Duplicate link in section ${section.id}`);
  }

  validateLinkReferences(refs, linkIDs, 'link reference');
}
