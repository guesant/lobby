import type { BrowserEnvironmentState } from './browser-environment.types.ts';

export function updateReducedMotion(state: BrowserEnvironmentState): void {
  state.controls.reducedMotion = state.media.matches;
}
