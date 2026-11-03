import type { InterfaceState } from './preferences.types.ts';

export function closeSettingsDialog(controls: InterfaceState): void {
  controls.dialog = 'none';
}
