import { updatePageChrome } from '../../browser/navigation.ts';
import type { LayoutRuntime } from './layout-runtime.types.ts';
import { normalizeLayoutNavigation } from './normalize-layout-navigation.ts';

export function afterLayoutNavigation(runtime: LayoutRuntime): void {
  const normalize = normalizeLayoutNavigation.bind(null, runtime);

  updatePageChrome();
  queueMicrotask(normalize);
}
