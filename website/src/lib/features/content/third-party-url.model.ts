import type { LinkDocument } from './content.types.ts';

export function thirdPartyURL(
  site: LinkDocument['site'],
  url: string,
): boolean {
  if (!/^https?:/i.test(url)) {
    return false;
  }

  const host = new URL(url).hostname.toLowerCase()
    .replace(/\.$/, '');

  for (const domain of site.first_party_domains) {
    if (host === domain || host.endsWith(`.${domain}`)) {
      return false;
    }
  }

  return true;
}
