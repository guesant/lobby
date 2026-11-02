import type { BootController } from './boot-controller.types.ts';
import type { BootControllerState } from './boot-controller.types.ts';
import { finishBoot } from './finish-boot.ts';
import { startBoot } from './start-boot.ts';

export function createBootController(
  state: BootControllerState,
): BootController {
  return {
    start: startBoot.bind(null, state),
    finish: finishBoot.bind(null, state),
    destroy: finishBoot.bind(null, state),
  };
}
