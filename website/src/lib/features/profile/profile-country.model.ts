import { record } from '../content/validation.model.ts';
import { catalogLabels } from './catalog-labels.model.ts';
import { catalogURL } from './catalog-url.model.ts';
import type { PersonalProfile } from './profile.types.ts';

export function profileCountry(
  value: unknown,
): PersonalProfile['birth_country'] {
  const country = record(value, 'birth country');

  return {
    labels: catalogLabels(country['labels']),
    url: catalogURL(country['url']),
  };
}
