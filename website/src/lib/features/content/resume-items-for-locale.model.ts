import type { FederationItem, SiteData } from './content.types.ts';
import { federationItemsForLanguage } from './federation-items-for-language.model.ts';
import { federationItemsForSource } from './federation-items-for-source.model.ts';

export function resumeItemsForLocale(
  data: SiteData,
  locale: string,
): FederationItem[] {
  const resume = federationItemsForSource(data.federation.items, 'resume');

  const preferred = federationItemsForLanguage(resume, locale);

  if (preferred.length > 0) {
    return preferred;
  }

  return federationItemsForLanguage(resume, 'en');
}
