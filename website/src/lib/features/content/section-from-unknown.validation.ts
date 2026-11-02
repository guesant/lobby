import type { LinkRecord, SectionRecord } from './content.types.ts';
import { linkFromUnknown, sectionLabels } from './link-fields.validation.ts';
import { sectionOptionalProperties } from './section-optional-properties.validation.ts';
import {
  array,
  optionalString,
  record,
  requiredText,
} from './validation.model.ts';

export function sectionFromUnknown(
  value: unknown,
  index: number,
  languages: Set<string>,
): SectionRecord {
  const label = `links.sections[${String(index)}]`;

  const source = record(value, label);

  const links: LinkRecord[] = [];

  for (const [
    linkIndex,
    item,
  ] of array(source['links'] ?? [], `${label}.links`)
      .entries()) {
    const linkLabel = `${label}.links[${String(linkIndex)}]`;

    const link = linkFromUnknown(item, linkLabel, languages);

    links.push(link);
  }

  const id = requiredText(source['id'], `${label}.id`);

  const icon = optionalString(source['icon'], `${label}.icon`) ?? 'book';

  const labels = sectionLabels(source['labels'], `${label}.labels`, languages);

  const optionalProperties = sectionOptionalProperties(source, label);

  return {
    id,
    icon,
    labels,
    links,
    ...optionalProperties,
  };
}
