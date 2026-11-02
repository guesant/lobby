import type { SearchItem } from '../search/search.types.ts';
import type { CatalogCandidate } from './ai-catalog.types.ts';

export function appendCatalogCandidate(
  candidates: Map<string, CatalogCandidate>,
  item: SearchItem,
  variant: Omit<CatalogCandidate['variants'][number], 'item'>,
): void {
  const key = `${item.id}\u0000${item.language}`;

  let candidate = candidates.get(key);

  if (!candidate) {
    candidate = {
      id: item.id,
      language: item.language,
      variants: [],
    };
    candidates.set(key, candidate);
  }

  candidate.variants.push({
    ...variant,
    item,
  });
}
