import { personalProfile } from '../profile/personal-profile.model.ts';
import type { SiteData } from './content.types.ts';
import { validateCredits } from './credits.validation.ts';
import { validateEditorial } from './editorial.validation.ts';
import { validateFederation } from './federation.validation.ts';
import { linkDocumentFromUnknown } from './link-document-from-unknown.validation.ts';
import { validateStatistics } from './statistics.validation.ts';

export function validateSiteDocuments(input: {
  links: unknown;
  profile: unknown;
  editorial: unknown;
  credits: unknown;
  statistics: unknown;
  federation: unknown;
}): SiteData {
  return {
    personalProfile: personalProfile(input.profile),
    links: linkDocumentFromUnknown(input.links),
    editorial: validateEditorial(input.editorial),
    credits: validateCredits(input.credits),
    statistics: validateStatistics(input.statistics),
    federation: validateFederation(input.federation),
  };
}
