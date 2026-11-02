import type { CatalogEntry } from './ai-catalog.types.ts';

export function uniqueCatalogEntries(entries: CatalogEntry[]): CatalogEntry[] {
  const identities = new Set<string>();

  for (const entry of entries) {
    const identity = `${entry.id}\u0000${entry.language}`;

    if (identities.has(identity)) {
      throw new Error(`Duplicate public catalog record: ${entry.id}`);
    }

    identities.add(identity);
  }

  return entries;
}
