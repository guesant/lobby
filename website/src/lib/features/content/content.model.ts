import { linkNavigation } from '../../link-navigation.ts';
import { siteOrigin } from '../navigation/origin.model.ts';
import type {
  LinkDestination,
  LinkDocument,
  LinkRecord,
} from './content.types.ts';
import { textOr } from './text-or.model.ts';
import { thirdPartyURL } from './third-party-url.model.ts';

export function resolveDestination(
  site: LinkDocument['site'],
  item: Pick<LinkRecord, 'url' | 'target'>,
  origin: string = siteOrigin,
): LinkDestination {
  const trimmedURL = item.url?.trim();

  const url = textOr(trimmedURL, '#');

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
