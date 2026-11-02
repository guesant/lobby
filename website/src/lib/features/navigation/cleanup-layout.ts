import type { LayoutRuntime } from './layout-runtime.types.ts';

export function cleanupLayout(runtime: LayoutRuntime): void {
  runtime.navigation?.destroy();
  runtime.environment?.destroy();
}
