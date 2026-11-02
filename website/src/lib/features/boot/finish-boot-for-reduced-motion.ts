import type { InterfaceState } from '../preferences/preferences.model.ts';
import type { BootState } from './boot.model.ts';
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
