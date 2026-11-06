import type { SiteData } from '../content/content.types.ts';
import type { PersonalProfile } from './profile.types.ts';
import { profileFacts } from './profile-facts.model.ts';

export function profilePresentation(
  profile: PersonalProfile,
  localized: SiteData['links']['locales'][string],
  locale: string,
): SiteData['links']['locales'][string] {
  const facts = profileFacts(profile, locale);

  const original = localized.presentation.facts;

  return {
    ...localized,
    presentation: {
      ...localized.presentation,
      facts: [
        ...facts,
        ...original,
      ],
    },
  };
}
