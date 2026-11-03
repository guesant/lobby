import type { InterfaceState } from '../preferences/preferences.types.ts';
import type { LayoutRuntime } from './layout-runtime.types.ts';

export function updateLayoutEnvironment(
  runtime: LayoutRuntime,
  controls: InterfaceState,
): void {
  runtime.environment?.update(controls);
}
