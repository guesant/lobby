import type { SettingsDialogContext } from './sync-settings-dialog.types.ts';

export function closeSettingsDialog(context: SettingsDialogContext): void {
  context.dialog?.close();
}
