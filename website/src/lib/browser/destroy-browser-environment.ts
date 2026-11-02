import type { BrowserEnvironmentState } from './browser-environment.types.ts';

export function destroyBrowserEnvironment(
  state: BrowserEnvironmentState,
): void {
  state.sound.destroy();
  state.stopMedia?.();
}
