import type { LayoutRuntime } from './layout-runtime.types.ts';

export function normalizeLayoutNavigation(runtime: LayoutRuntime): void {
  void runtime.navigation?.normalize();
}
