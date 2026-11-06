import { requiredText } from '../content/validation.model.ts';
import type { PersonalProfile } from './profile.types.ts';
import { profileLanguages } from './profile-languages.model.ts';

export function profileFacts(
  profile: PersonalProfile,
  locale: string,
): {
  icon: string;
  text: string;
}[] {
  const languages = profileLanguages(profile, locale);

  const languageNames = languages.join(', ');

  const residence = requiredText(
    profile.residence[locale],
    `residence ${locale}`,
  );

  const birthPlace = requiredText(
    profile.birth_place[locale],
    `birth place ${locale}`,
  );

  const born = requiredText(
    profile.labels.born[locale],
    `born label ${locale}`,
  );

  const lives = requiredText(
    profile.labels.lives[locale],
    `residence label ${locale}`,
  );

  const spoken = requiredText(
    profile.labels.languages[locale],
    `languages label ${locale}`,
  );

  return [
    {
      icon: 'user',
      text: `${lives}: ${residence}`,
    },
    {
      icon: 'user',
      text: `${born}: ${birthPlace}`,
    },
    {
      icon: 'user',
      text: `${spoken}: ${languageNames}`,
    },
  ];
}
