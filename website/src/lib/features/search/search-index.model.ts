import { isSearchItem } from './search.model.ts';
import type { SearchItem } from './search.types.ts';

export async function readSearchIndex(
  url: string,
  signal: AbortSignal,
): Promise<SearchItem[]> {
  const response = await fetch(url, {
    signal,
  });

  if (!response.ok) {
    throw new Error(`Search index unavailable: ${String(response.status)}`);
  }

  const payload: unknown = await response.json();

  if (!Array.isArray(payload) || !payload.every(isSearchItem)) {
    throw new Error('Invalid search index');
  }

  return payload;
}
