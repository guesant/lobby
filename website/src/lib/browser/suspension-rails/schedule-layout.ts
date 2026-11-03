import type { RailLayoutState } from './rail-layout.types.ts';
import { runScheduledLayout } from './run-scheduled-layout.ts';

export function scheduleLayout(state: RailLayoutState): void {
  if (state.controller.signal.aborted || state.frame !== null) {
    return;
  }

  const runLayout = runScheduledLayout.bind(null, state);

  state.frame = requestAnimationFrame(runLayout);
}
