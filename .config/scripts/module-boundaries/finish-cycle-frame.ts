import type { CycleFrame, CycleState } from './cycle-state.types.ts';

export function finishCycleFrame(state: CycleState, stack: CycleFrame[]): void {
  const frame = stack.pop();

  if (!frame) {
    return;
  }

  state.active.delete(frame.module);
  state.path.pop();
  state.visited.add(frame.module);
}
