import { optionalTechnologyCatalog } from '../profile/optional-technology-catalog.model.ts';
import type { FederationItem, SiteData } from './content.types.ts';
import { validateFederationItem } from './validate-federation-item.validation.ts';
import { array, record } from './validation.model.ts';

export function validateFederation(value: unknown): SiteData['federation'] {
  const feed = record(value, 'federation data');

  if (feed['version'] !== 1) {
    throw new Error('Invalid federation.version');
  }

  const identities = new Set<string>();

  const items: FederationItem[] = [];

  for (const [
    index,
    item,
  ] of array(feed['items'], 'federation.items')
      .entries()) {
    const validatedItem = validateFederationItem(item, index, identities);

    items.push(validatedItem);
  }

  return {
    version: 1,
    items,
    ...optionalTechnologyCatalog(feed['technologies']),
  };
}
