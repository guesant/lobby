import type { SearchDialogState } from './close-search-dialog.types.ts';

export function closeSearchDialog(state: SearchDialogState): void {
  state.dialog = 'none';
}
