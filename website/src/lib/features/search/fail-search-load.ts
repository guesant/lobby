import type { SearchControllerState } from './search-controller.types.ts';

export function failSearchLoad(
  context: SearchControllerState,
  request: AbortController,
): void {
  if (
    context.destroyed ||
    context.pending !== request ||
    request.signal.aborted
  ) {
    return;
  }

  context.state.phase = 'error';
}
