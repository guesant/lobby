import type { LinkRecord } from '../content/content.types.ts';
import { requiredText } from '../content/validation.model.ts';
import { localizedURL } from '../navigation/routes.model.ts';
import type { PublicProfile } from './profile.types.ts';

export function profileContact(
  links: LinkRecord[],
  id: string,
): PublicProfile['contacts'][number] | undefined {
  for (const link of links) {
    if (link.id === id) {
      return {
        id,
        title: requiredText(link.labels['en']?.title, `contact ${id}`),
        url: localizedURL(link, 'en'),
      };
    }
  }

  return undefined;
}
