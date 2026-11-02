import type { SectionRecord } from './content.types.ts';
import { optionalStrings, publicationFlags } from './link-fields.validation.ts';
import { optionalProperty } from './object-fields.model.ts';
import type { UnknownRecord } from './validation.model.ts';
import { optionalBoolean } from './validation.model.ts';

export function sectionOptionalProperties(
  source: UnknownRecord,
  label: string,
): Pick<SectionRecord, 'link_refs' | 'editorial'> &
  ReturnType<typeof publicationFlags> {
  const linkReferences = optionalStrings(
    source['link_refs'],
    `${label}.link_refs`,
  );

  const editorial = optionalBoolean(source['editorial'], `${label}.editorial`);

  const optionalLinkReferences = optionalProperty('link_refs', linkReferences);

  const optionalEditorial = optionalProperty('editorial', editorial);

  const publication = publicationFlags(source, label);

  return {
    ...optionalLinkReferences,
    ...optionalEditorial,
    ...publication,
  };
}
