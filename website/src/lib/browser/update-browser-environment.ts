import type { InterfaceState } from '../features/preferences/preferences.types.ts';
import { applyBrowserPreferences } from './apply-browser-preferences.ts';
import type { BrowserEnvironmentState } from './browser-environment.types.ts';

export function updateBrowserEnvironment(
  state: BrowserEnvironmentState,
  current: InterfaceState,
): void {
  applyBrowserPreferences(current);
  state.sound.setEnabled(current.sound === 'on');
}
