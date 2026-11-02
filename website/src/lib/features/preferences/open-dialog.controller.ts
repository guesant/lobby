import type { DialogName, InterfaceState } from './preferences.model.ts';

export function openDialog(state: InterfaceState, dialog: DialogName): void {
  state.dialog = dialog;
}
