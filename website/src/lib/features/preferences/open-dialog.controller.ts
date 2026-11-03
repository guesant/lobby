import type { DialogName, InterfaceState } from './preferences.types.ts';

export function openDialog(state: InterfaceState, dialog: DialogName): void {
  state.dialog = dialog;
}
