import type { SearchControllerState } from './search-controller.types.ts';
import { searchLoad } from './search-load.ts';

export async function searchPrepare(
  context: SearchControllerState,
): Promise<void> {
  if (
    context.state.phase === 'idle' ||
    context.loadedURL !== context.dependencies.indexURL()
  ) {
    await searchLoad(context);
  }
}
