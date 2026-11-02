import type { LinkDocument } from './content.types.ts';
import { personalUpdateSection } from './personal-update-section.validation.ts';
import { seoFromUnknown } from './seo.validation.ts';
import { array, record, requiredText } from './validation.model.ts';

export function personalUpdate(
  value: unknown,
  label: string,
): LinkDocument['now'][string] {
  const source = record(value, label);

  const sections: LinkDocument['now'][string]['sections'] = [];

  let index = 0;

  for (const section of array(source['sections'], `${label}.sections`)) {
    const sectionLabel = `${label}.sections[${String(index)}]`;

    const validatedSection = personalUpdateSection(section, sectionLabel);

    sections.push(validatedSection);
    index += 1;
  }

  return {
    seo: seoFromUnknown(source['seo'], `${label}.seo`),
    title: requiredText(source['title'], `${label}.title`),
    intro: requiredText(source['intro'], `${label}.intro`),
    sections,
  };
}
