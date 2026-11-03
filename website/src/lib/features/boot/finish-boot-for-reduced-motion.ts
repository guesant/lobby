import type { InterfaceState } from '../preferences/preferences.types.ts';
import type { BootState } from './boot.types.ts';
import type { BootController } from './boot-controller.types.ts';

export function finishBootForReducedMotion(
  model: BootState,
  preferences: InterfaceState,
  controller: BootController,
): void {
  if (
    model.running &&
    (preferences.motion === 'off' || preferences.reducedMotion)
  ) {
    controller.finish();
  }
}
