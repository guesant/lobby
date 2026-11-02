import type { SiteData } from '../content/content.types.ts';
import type { CatalogCandidate } from './ai-catalog.types.ts';
import { collectCatalogLocale } from './collect-catalog-locale.server.ts';

export function collectCatalogCandidates(
  data: SiteData,
): Map<string, CatalogCandidate> {
  const candidates = new Map<string, CatalogCandidate>();

  for (const language of data.links.language_options) {
    collectCatalogLocale(data, language.id, candidates);
  }

  return candidates;
}
