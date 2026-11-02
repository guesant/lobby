import type { InterfaceState } from '../preferences/preferences.model.ts';

export function closeCreditsDialog(state: InterfaceState, event: Event): void {
  const dialog = event.currentTarget;

  if (
    dialog instanceof HTMLDialogElement &&
    !dialog.open &&
    state.dialog === 'credits'
  ) {
    state.dialog = 'none';
  }
}
