import type { SiteData } from '../content/content.types.ts';
import type { CatalogEntry } from './ai-catalog.types.ts';
import { catalogEntry } from './catalog-entry.server.ts';
import { collectCatalogCandidates } from './collect-catalog-candidates.server.ts';

export function catalogEntries(data: SiteData): CatalogEntry[] {
  const candidates = collectCatalogCandidates(data);

  const output: CatalogEntry[] = [];

  for (const candidate of candidates.values()) {
    const entry = catalogEntry(candidate);

    output.push(entry);
  }

  return output;
}
