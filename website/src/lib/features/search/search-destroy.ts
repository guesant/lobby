import type { SearchControllerState } from './search-controller.types.ts';

export function searchDestroy(context: SearchControllerState): void {
  context.destroyed = true;
  context.pending?.abort();
}
