import type { CycleFrame, CycleState } from './cycle-state.types.ts';

export function enterCycleFrame(state: CycleState, frame: CycleFrame): void {
  frame.entered = true;
  state.active.set(frame.module, state.path.length);
  state.path.push(frame.module);
}
