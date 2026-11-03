import { installBrowserEnvironment } from '../../browser/environment.ts';
import { createBrowserNavigation } from '../../browser/navigation.ts';
import type { PreferenceController } from '../preferences/preference-controller.types.ts';
import type { InterfaceState } from '../preferences/preferences.types.ts';
import { cleanupLayout } from './cleanup-layout.ts';
import type { LayoutRuntime } from './layout-runtime.types.ts';

export function mountLayout(
  runtime: LayoutRuntime,
  controls: InterfaceState,
  preferences: PreferenceController,
): () => void {
  preferences.restore();
  runtime.environment = installBrowserEnvironment(controls);
  runtime.navigation = createBrowserNavigation();

  return cleanupLayout.bind(null, runtime);
}
