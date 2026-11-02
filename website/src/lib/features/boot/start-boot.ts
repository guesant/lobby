import { advanceBoot } from './advance-boot.ts';
import { bootInterval } from './boot.model.ts';
import type { BootControllerState } from './boot-controller.types.ts';
import { finishBoot } from './finish-boot.ts';

export function startBoot(state: BootControllerState): void {
  finishBoot(state);

  if (
    !state.dialog?.isConnected ||
    state.preferences.motion === 'off' ||
    state.preferences.reducedMotion
  ) {
    return;
  }

  state.model.step = 0;
  state.model.running = true;

  const advance = advanceBoot.bind(null, state);

  state.timer = setTimeout(advance, bootInterval);
}
