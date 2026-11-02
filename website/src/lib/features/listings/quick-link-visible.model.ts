import type { LinkRecord } from '../content/content.types.ts';

export function quickLinkVisible(link: LinkRecord): boolean {
  return (
    link.enabled !== false &&
    link.public !== false &&
    !link.private &&
    !link.draft
  );
}
