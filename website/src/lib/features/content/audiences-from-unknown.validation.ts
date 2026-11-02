import type { LinkDocument } from './content.types.ts';
import {
  array,
  record,
  requiredText,
  validateTextMap,
} from './validation.model.ts';

export function audiencesFromUnknown(
  value: unknown,
): LinkDocument['audiences'] {
  const audiences: LinkDocument['audiences'] = [];

  for (const [
    index,
    raw,
  ] of array(value, 'links.audiences')
      .entries()) {
    const label = `links.audiences[${String(index)}]`;

    const audience = record(raw, label);

    const id = requiredText(audience['id'], `${label}.id`);

    const labels = validateTextMap(audience['labels'], `${label}.labels`);

    audiences.push({
      id,
      labels,
    });
  }

  return audiences;
}
