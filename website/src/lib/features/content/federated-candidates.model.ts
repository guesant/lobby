import type { FederationItem, SiteData } from './content.types.ts';
import { federationItemsForSource } from './federation-items-for-source.model.ts';
import { resumeItemsForLocale } from './resume-items-for-locale.model.ts';

export function federatedCandidates(
  data: SiteData,
  locale: string,
): FederationItem[] {
  return [
    ...federationItemsForSource(data.federation.items, 'blog'),
    ...resumeItemsForLocale(data, locale),
  ];
}
