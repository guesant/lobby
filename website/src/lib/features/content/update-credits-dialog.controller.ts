import { showDialog } from '#lib/browser/dialog.ts';

export function updateCreditsDialog(
  dialog: HTMLDialogElement,
  open: boolean,
): void {
  showDialog(dialog, open);
}
