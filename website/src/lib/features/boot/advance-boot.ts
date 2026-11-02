import { bootInterval, bootSteps } from './boot.model.ts';
import type { BootControllerState } from './boot-controller.types.ts';
import { finishBoot } from './finish-boot.ts';

export function advanceBoot(state: BootControllerState): void {
  state.model.step += 1;

  if (state.model.step >= bootSteps) {
    finishBoot(state);

    return;
  }

  const advance = advanceBoot.bind(null, state);

  state.timer = setTimeout(advance, bootInterval);
}
