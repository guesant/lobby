import { array, record } from '../content/validation.model.ts';
import { catalogIdentity } from './catalog-identity.model.ts';
import { catalogLabels } from './catalog-labels.model.ts';
import type { PersonalProfile } from './profile.types.ts';

export function spokenLanguages(
  value: unknown,
): PersonalProfile['spoken_languages'] {
  const ids = new Set<string>();

  const output = [];

  for (const entry of array(value, 'spoken languages')) {
    const item = record(entry, 'spoken language');

    const language = {
      id: catalogIdentity(item['id'], ids),
      labels: catalogLabels(item['labels']),
    };

    output.push(language);
  }

  return output;
}
