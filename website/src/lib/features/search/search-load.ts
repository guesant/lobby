import { beginSearchLoad } from './begin-search-load.ts';
import { completeSearchLoad } from './complete-search-load.ts';
import { failSearchLoad } from './fail-search-load.ts';
import { loadSearchEntries } from './load-search-entries.ts';
import type { SearchControllerState } from './search-controller.types.ts';

export async function searchLoad(
  context: SearchControllerState,
): Promise<void> {
  const url = context.dependencies.indexURL();

  if (
    context.destroyed ||
    (context.state.phase === 'loading' && context.loadedURL === url)
  ) {
    return;
  }

  const request = beginSearchLoad(context, url);

  try {
    const entries = await loadSearchEntries(context, url, request);

    completeSearchLoad(context, request, entries);
  } catch {
    failSearchLoad(context, request);
  }
}
