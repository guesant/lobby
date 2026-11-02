import { linkNavigation } from '../../link-navigation.ts';
import { siteOrigin } from '../navigation/origin.model.ts';
import type {
  LinkDestination,
  LinkDocument,
  LinkRecord,
} from './content.types.ts';
import { textOr } from './text.model.ts';

function thirdPartyURL(site: LinkDocument['site'], url: string): boolean {
  if (!/^https?:/i.test(url)) {
    return false;
  }

  const host = new URL(url).hostname.toLowerCase()
    .replace(/\.$/, '');

  return !site.first_party_domains.some((domain): boolean => {
    return host === domain || host.endsWith(`.${domain}`);
  });
}

export function resolveDestination(
  site: LinkDocument['site'],
  item: Pick<LinkRecord, 'url' | 'target'>,
  origin: string = siteOrigin,
): LinkDestination {
  const url = textOr(item.url?.trim(), '#');

  const navigation = linkNavigation(url, origin);

  let target = textOr(item.target, '_self');

  if (navigation.external) {
    target = '_blank';
  }

  const destination: LinkDestination = {
    href: url,
    external: navigation.external || /^(mailto:|tel:)/i.test(url),
    thirdParty: thirdPartyURL(site, url),
    target,
    display: url.replace(/^mailto:/i, ''),
  };

  if (target === '_blank') {
    destination.rel = 'noopener noreferrer';
  }

  return destination;
}
