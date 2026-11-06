import { requiredText } from '../content/validation.model.ts';
import type { PersonalProfile } from './profile.types.ts';

export function profileLanguages(
  profile: PersonalProfile,
  locale: string,
): string[] {
  const languages: string[] = [];

  for (const language of profile.spoken_languages) {
    const label = requiredText(
      language.labels[locale],
      `spoken language ${locale}`,
    );

    languages.push(label);
  }

  return languages;
}
