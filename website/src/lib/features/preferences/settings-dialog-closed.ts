import type { InterfaceState } from './preferences.model.ts';

export function settingsDialogClosed(
  controls: InterfaceState,
  event: Event,
): void {
  const dialog = event.currentTarget;

  if (
    dialog instanceof HTMLDialogElement &&
    !dialog.open &&
    controls.dialog === 'settings'
  ) {
    controls.dialog = 'none';
  }
}
