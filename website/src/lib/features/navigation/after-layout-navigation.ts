import { updatePageChrome } from '../../browser/navigation.ts';
import type { LayoutRuntime } from './layout-runtime.types.ts';
import { normalizeLayoutNavigation } from './normalize-layout-navigation.ts';
import { scrollQuickAccess } from './scroll-quick-access.ts';
import type { AfterNavigate } from '$app/navigation';

export function afterLayoutNavigation(
  runtime: LayoutRuntime,
  navigation: AfterNavigate,
): void {
  const normalize = normalizeLayoutNavigation.bind(null, runtime);

  updatePageChrome();
  scrollQuickAccess(navigation);
  queueMicrotask(normalize);
}
