import type { BootState } from './boot.model.ts';

export function createBootViewModel(): BootState {
  const state = $state<BootState>({
    step: 0,
    running: false,
  });

  return state;
}
