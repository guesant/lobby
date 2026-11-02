import type { SectionRecord } from './content.types.ts';
import { sectionLabel } from './section-label.validation.ts';
import { record } from './validation.model.ts';

export function sectionLabels(
  value: unknown,
  label: string,
  languages: Set<string>,
): SectionRecord['labels'] {
  const source = record(value, label);

  const labels: SectionRecord['labels'] = {};

  for (const language of languages) {
    labels[language] = sectionLabel(source[language], `${label}.${language}`);
  }

  return labels;
}
