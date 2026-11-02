import type { CycleFrame } from './cycle-state.types.ts';

export function createCycleFrame(module: string): CycleFrame {
  return {
    module,
    dependencyIndex: 0,
    entered: false,
  };
}
