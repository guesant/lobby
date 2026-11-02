type SearchDialogState = {
  dialog: string;
};

export function closeSearchDialog(state: SearchDialogState): void {
  state.dialog = 'none';
}
