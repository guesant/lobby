import type { SearchControllerState } from './search-controller.types.ts';

export function beginSearchLoad(
  context: SearchControllerState,
  url: string,
): AbortController {
  context.pending?.abort();

  const request = new AbortController();

  context.pending = request;
  context.loadedURL = url;
  context.state.phase = 'loading';

  return request;
}
