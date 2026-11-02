import type { InterfaceState } from './preferences.model.ts';

export function closeSettingsDialog(controls: InterfaceState): void {
  controls.dialog = 'none';
}
