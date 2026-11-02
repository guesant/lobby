import { showDialog } from '../../browser/dialog.ts';
import type { SearchController } from './search.controller.ts';
import type { SearchDialogContext } from './search-dialog-context.types.ts';

type SearchDialogState = {
  dialog: string;
};

export function syncSearchDialog(
  context: SearchDialogContext,
  state: SearchDialogState,
  actions: SearchController,
): void {
  const opened = state.dialog === 'search';

  showDialog(context.dialog, opened);

  if (opened) {
    context.input?.focus();
    void actions.prepare();
  }
}
