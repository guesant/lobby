import { showDialog } from '../../browser/dialog.ts';
import type {
  SettingsDialogContext,
  SettingsState,
} from './sync-settings-dialog.types.ts';

export function syncSettingsDialog(
  context: SettingsDialogContext,
  state: SettingsState,
): void {
  showDialog(context.dialog, state.dialog === 'settings');
}
