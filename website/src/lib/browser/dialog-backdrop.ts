export function dialogBackdrop(event: MouseEvent): void {
  if (
    event.target === event.currentTarget &&
    event.currentTarget instanceof HTMLDialogElement
  ) {
    event.currentTarget.close();
  }
}
