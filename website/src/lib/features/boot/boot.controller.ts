import type { BootState } from './boot.model.ts';
import { bootInterval, bootSteps } from './boot.model.ts';

type BootDependencies = {
  canStart: () => boolean;
};

export type BootController = {
  start: () => void;
  finish: () => void;
  destroy: () => void;
};

export function createBootController(
  state: BootState,
  dependencies: BootDependencies,
): BootController {
  let timer: ReturnType<typeof setTimeout> | undefined;

  function finish(): void {
    clearTimeout(timer);
    timer = undefined;
    state.running = false;
  }

  function advance(): void {
    state.step += 1;

    if (state.step >= bootSteps) {
      finish();

      return;
    }

    timer = setTimeout(advance, bootInterval);
  }

  function start(): void {
    finish();

    if (!dependencies.canStart()) {
      return;
    }

    state.step = 0;
    state.running = true;
    timer = setTimeout(advance, bootInterval);
  }

  return {
    start,
    finish,
    destroy: finish,
  };
}
