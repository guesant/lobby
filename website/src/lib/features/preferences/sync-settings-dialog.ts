import { showDialog } from '../../browser/dialog.ts';

type SettingsDialogContext = {
  dialog: HTMLDialogElement | undefined;
};

type SettingsState = {
  dialog: string;
};

export function syncSettingsDialog(
  context: SettingsDialogContext,
  state: SettingsState,
): void {
  showDialog(context.dialog, state.dialog === 'settings');
}
