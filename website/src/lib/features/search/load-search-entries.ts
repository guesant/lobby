import type { SearchItem } from './search.types.ts';
import type { SearchControllerState } from './search-controller.types.ts';
import { readSearchIndex } from './search-index.model.ts';

export function loadSearchEntries(
  context: SearchControllerState,
  url: string,
  request: AbortController,
): Promise<SearchItem[]> {
  const reader = context.dependencies.readIndex ?? readSearchIndex;

  const timeout = AbortSignal.timeout(10000);

  const signal = AbortSignal.any([
    request.signal,
    timeout,
  ]);

  return reader(url, signal);
}
