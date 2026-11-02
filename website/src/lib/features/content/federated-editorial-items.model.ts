import type { EditorialRecord, SiteData } from './content.types.ts';
import { federatedCandidates } from './federated-candidates.model.ts';
import { uniqueFederatedEditorialItems } from './unique-federated-editorial-items.model.ts';

export function federatedEditorialItems(
  data: SiteData,
  sectionID: string,
  locale: string,
): EditorialRecord[] {
  const candidates = federatedCandidates(data, locale);

  return uniqueFederatedEditorialItems(candidates, sectionID, locale);
}
