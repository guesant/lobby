import type { LinkRecord } from './content.types.ts';
import { linkLabel } from './link-label.validation.ts';
import { record } from './validation.model.ts';

export function localizedLinkLabels(
  value: unknown,
  label: string,
  languages: Set<string>,
): LinkRecord['labels'] {
  const source = record(value, label);

  const labels: LinkRecord['labels'] = {};

  for (const language of languages) {
    labels[language] = linkLabel(source[language], `${label}.${language}`);
  }

  return labels;
}
