import type { SearchItem } from './search.types.ts';
import type { SearchControllerState } from './search-controller.types.ts';

export function completeSearchLoad(
  context: SearchControllerState,
  request: AbortController,
  entries: SearchItem[],
): void {
  if (context.destroyed || context.pending !== request) {
    return;
  }

  context.state.index = entries;
  context.state.phase = 'ready';
}
