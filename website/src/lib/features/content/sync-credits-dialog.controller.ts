import { updateCreditsDialog } from './update-credits-dialog.controller.ts';
import { showDialog } from '#lib/browser/dialog.ts';

export function syncCreditsDialog(
  dialog: HTMLDialogElement,
  open: boolean,
): {
  update: (next: boolean) => void;
} {
  showDialog(dialog, open);

  return {
    update: updateCreditsDialog.bind(null, dialog),
  };
}
