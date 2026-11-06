import type { SiteData } from '../content/content.types.ts';
import { visibleLinks } from '../navigation/visible-links.model.ts';
import type { PublicProfile } from './profile.types.ts';
import { profileContact } from './profile-contact.model.ts';

export function profileContacts(data: SiteData): PublicProfile['contacts'] {
  const available = visibleLinks(data.links);

  const contacts: PublicProfile['contacts'] = [];

  for (const id of data.personalProfile.contact_links) {
    const contact = profileContact(available, id);

    if (contact) {
      contacts.push(contact);
    }
  }

  return contacts;
}
