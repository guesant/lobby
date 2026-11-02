import type { LinkDocument } from './content.types.ts';
import {
  optionalString,
  record,
  requiredText,
  strings,
} from './validation.model.ts';

export function profileFromUnknown(value: unknown): LinkDocument['profile'] {
  const profile = record(value, 'links.profile');

  return {
    name: requiredText(profile['name'], 'links.profile.name'),
    username: requiredText(profile['username'], 'links.profile.username'),
    avatar: optionalString(profile['avatar'], 'links.profile.avatar') ?? '',
    birth_date: requiredText(profile['birth_date'], 'links.profile.birth_date'),
    same_as_links: strings(
      profile['same_as_links'],
      'links.profile.same_as_links',
    ),
  };
}
