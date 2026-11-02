import type { BootControllerState } from './boot-controller.types.ts';

export function finishBoot(state: BootControllerState): void {
  clearTimeout(state.timer);
  delete state.timer;
  state.model.running = false;
}
