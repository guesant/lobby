import type { EditorialEntry } from './content.types.ts';
import { optionalProperty } from './object-fields.model.ts';
import { record, requiredText } from './validation.model.ts';

export function validateEditorialLabels(
  value: unknown,
  label: string,
): EditorialEntry['labels'] {
  const source = record(value, label);

  const labels: EditorialEntry['labels'] = {};

  for (const [
    language,
    rawLabel,
  ] of Object.entries(source)) {
    const localized = record(rawLabel, `${label}.${language}`);

    const title = requiredText(
      localized['title'],
      `${label}.${language}.title`,
    );

    const description = localized['description'];

    if (description !== undefined && typeof description !== 'string') {
      throw new Error(`Invalid ${label}.${language}.description`);
    }

    labels[language] = {
      title,
      ...optionalProperty('description', description),
    };
  }

  return labels;
}
