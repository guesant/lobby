import type { BootState } from './boot.types.ts';

export function createBootViewModel(): BootState {
  const state = $state<BootState>({
    step: 0,
    running: false,
  });

  return state;
}
