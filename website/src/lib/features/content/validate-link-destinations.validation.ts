import type { LinkRecord } from './content.types.ts';
import { validateLinkDestination } from './validate-link-destination.validation.ts';

export function validateLinkDestinations(link: LinkRecord): void {
  const label = `links.${link.id}`;

  if (link.url !== undefined) {
    validateLinkDestination(link.url, `${label}.url`);
  }

  for (const [
    language,
    destination,
  ] of Object.entries(link.localized_urls ?? {})) {
    validateLinkDestination(destination, `${label}.localized_urls.${language}`);
  }
}
