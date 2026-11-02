import type { RailLayoutState } from './rail-layout.model.ts';

export function destroyLayout(state: RailLayoutState): void {
  state.controller.abort();
  state.observer?.disconnect();

  if (state.frame !== null) {
    cancelAnimationFrame(state.frame);
  }
}
