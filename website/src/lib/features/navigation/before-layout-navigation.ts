import type { LayoutRuntime } from './layout-runtime.types.ts';
import type { BeforeNavigate } from '$app/navigation';

export function beforeLayoutNavigation(
  runtime: LayoutRuntime,
  event: BeforeNavigate,
): void {
  runtime.navigation?.beforeNavigate(event.to?.url ?? null);
}
