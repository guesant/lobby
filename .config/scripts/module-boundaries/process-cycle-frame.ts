import { createCycleFrame } from './create-cycle-frame.ts';
import type { CycleFrame, CycleState } from './cycle-state.types.ts';
import { enterCycleFrame } from './enter-cycle-frame.ts';
import { finishCycleFrame } from './finish-cycle-frame.ts';
import { nextCycleDependency } from './next-cycle-dependency.ts';
import { recordCycle } from './record-cycle.ts';

export function processCycleFrame(
  state: CycleState,
  stack: CycleFrame[],
  graph: Map<string, string[]>,
): void {
  const frame = stack[stack.length - 1];

  if (!frame) {
    return;
  }

  if (!frame.entered) {
    enterCycleFrame(state, frame);
  }

  const dependency = nextCycleDependency(frame, graph);

  if (!dependency) {
    finishCycleFrame(state, stack);

    return;
  }

  if (state.active.has(dependency)) {
    recordCycle(state, dependency);

    return;
  }

  if (!state.visited.has(dependency)) {
    const frame = createCycleFrame(dependency);

    stack.push(frame);
  }
}
