export function showDialog(
  dialog: HTMLDialogElement | undefined,
  open: boolean,
): void {
  if (!dialog?.isConnected) {
    return;
  }

  if (open && !dialog.open) {
    dialog.showModal();

    return;
  }

  if (!open && dialog.open) {
    dialog.close();
  }
}
