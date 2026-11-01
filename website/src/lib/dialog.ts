export function dialogBackdrop(event: MouseEvent): void {
  if (
    event.target === event.currentTarget &&
    event.currentTarget instanceof HTMLDialogElement
  ) {
    event.currentTarget.close();
  }
}

export function showDialog(
  dialog: HTMLDialogElement | undefined,
  open: boolean,
): void {
  if (!dialog || !dialog.isConnected) {
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
