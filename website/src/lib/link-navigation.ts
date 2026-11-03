import { siteOrigin } from './features/navigation/origin.model.ts';
import type { LinkNavigation } from './link-navigation.types.ts';

export function linkNavigation(
  href: string,
  origin: string = siteOrigin,
): LinkNavigation {
  const url: URL = new URL(href, origin);

  const external: boolean =
    [
      'http:',
      'https:',
    ].includes(url.protocol) && url.origin !== new URL(origin).origin;

  if (external) {
    return {
      external,
      target: '_blank',
      rel: 'noopener noreferrer',
    };
  }

  return {
    external,
    target: '_self',
  };
}
