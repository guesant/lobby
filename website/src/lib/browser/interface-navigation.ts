import { createInterfaceController } from '../features/navigation/interface.controller.ts';
import { closeSettingsDialog } from '../features/preferences/close-settings-dialog.ts';
import type { InterfaceState } from '../features/preferences/preferences.types.ts';
import { currentBrowserURL } from './current-browser-url.ts';
import { currentInterfacePage } from './current-interface-page.ts';
import { navigateInterfaceURL } from './navigate-interface-url.ts';

export function createBrowserInterfaceController(
  controls: InterfaceState,
): ReturnType<typeof createInterfaceController> {
  const closeDialog = closeSettingsDialog.bind(null, controls);

  return createInterfaceController({
    page: currentInterfacePage,
    currentURL: currentBrowserURL,
    closeDialog,
    navigate: navigateInterfaceURL,
  });
}
