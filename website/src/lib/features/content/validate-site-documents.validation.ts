import type { SiteData } from './content.types.ts';
import { validateCredits } from './credits.validation.ts';
import { validateEditorial } from './editorial.validation.ts';
import { validateFederation } from './federation.validation.ts';
import { linkDocumentFromUnknown } from './link-document-from-unknown.validation.ts';
import { validateStatistics } from './statistics.validation.ts';

export function validateSiteDocuments(input: {
  links: unknown;
  editorial: unknown;
  credits: unknown;
  statistics: unknown;
  federation: unknown;
}): SiteData {
  return {
    links: linkDocumentFromUnknown(input.links),
    editorial: validateEditorial(input.editorial),
    credits: validateCredits(input.credits),
    statistics: validateStatistics(input.statistics),
    federation: validateFederation(input.federation),
  };
}
