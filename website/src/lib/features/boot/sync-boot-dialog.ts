import type { InterfaceState } from '../preferences/preferences.types.ts';
import type { BootControllerState } from './boot-controller.types.ts';

export function syncBootDialog(
  state: BootControllerState,
  preferences: InterfaceState,
): void {
  const dialog = state.dialog;

  if (!dialog) {
    return;
  }

  if (state.model.running) {
    if (document.activeElement instanceof HTMLElement) {
      state.previous = document.activeElement;
    }

    preferences.dialog = 'none';
    dialog.showModal();

    return;
  }

  dialog.close();

  if (state.previous?.isConnected) {
    state.previous.focus();
  }

  state.previous = null;
}
