import type { SearchItem } from '../search/search.types.ts';
import type { CatalogCandidate } from './ai-catalog.types.ts';
import { preferredCatalogVariant } from './preferred-catalog-variant.server.ts';

export function catalogRecord(candidate: CatalogCandidate): SearchItem {
  const primary =
    preferredCatalogVariant(
      candidate.variants,
      'minecraft',
      candidate.language,
    ) ??
    preferredCatalogVariant(candidate.variants, 'terminal', candidate.language);

  if (!primary) {
    throw new Error(`Missing public catalog record: ${candidate.id}`);
  }

  return primary.item;
}
