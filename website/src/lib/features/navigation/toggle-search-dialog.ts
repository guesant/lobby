import type { InterfaceState } from '../preferences/preferences.types.ts';

export function toggleSearchDialog(
  controls: InterfaceState,
  event: KeyboardEvent,
): void {
  if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== 'k') {
    return;
  }

  event.preventDefault();

  if (controls.dialog === 'search') {
    controls.dialog = 'none';

    return;
  }

  controls.dialog = 'search';
}
