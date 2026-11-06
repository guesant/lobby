import { record, requiredText, strings } from '../content/validation.model.ts';
import { catalogLabels } from './catalog-labels.model.ts';
import type { PersonalProfile } from './profile.types.ts';
import { profileCountry } from './profile-country.model.ts';
import { spokenLanguages } from './spoken-languages.model.ts';

export function personalProfile(value: unknown): PersonalProfile {
  const profile = record(value, 'personal profile');

  const labels = record(profile['labels'], 'personal profile labels');

  if (profile['version'] !== 1) {
    throw new Error('Unsupported personal profile version');
  }

  return {
    version: 1,
    full_name: requiredText(profile['full_name'], 'profile full name'),
    spoken_languages: spokenLanguages(profile['spoken_languages']),
    birth_place: catalogLabels(profile['birth_place']),
    residence: catalogLabels(profile['residence']),
    birth_country: profileCountry(profile['birth_country']),
    labels: {
      born: catalogLabels(labels['born']),
      lives: catalogLabels(labels['lives']),
      languages: catalogLabels(labels['languages']),
    },
    contact_links: strings(profile['contact_links'], 'profile contact links'),
  };
}
