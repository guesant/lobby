import type { SiteData } from '../content/content.types.ts';
import { requiredText } from '../content/validation.model.ts';
import type { PublicProfile } from './profile.types.ts';
import { profileContacts } from './profile-contacts.model.ts';
import { profileInterests } from './profile-interests.model.ts';
import { profileLanguages } from './profile-languages.model.ts';
import { profileRevision } from './profile-revision.server.ts';

export function publicProfile(data: SiteData): PublicProfile {
  const profile = data.personalProfile;

  if (data.federation.technologies === undefined) {
    throw new Error(
      'Resume feed must provide the technologies catalog for profile.yaml',
    );
  }

  return {
    version: 1,
    source: {
      url: 'https://guesant.net/profile.yaml',
      revision: profileRevision(),
    },
    language: 'en',
    name: profile.full_name,
    username: data.links.profile.username,
    spoken_languages: profileLanguages(profile, 'en'),
    birth_place: requiredText(profile.birth_place['en'], 'English birth place'),
    residence: requiredText(profile.residence['en'], 'English residence'),
    birth_country: {
      name: requiredText(profile.birth_country.labels['en'], 'English country'),
      url: profile.birth_country.url,
    },
    contacts: profileContacts(data),
    interests: profileInterests(data),
    technologies: data.federation.technologies,
  };
}
