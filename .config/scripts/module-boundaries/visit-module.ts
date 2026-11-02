import { createCycleFrame } from './create-cycle-frame.ts';
import type { CycleState } from './cycle-state.types.ts';
import { processCycleFrame } from './process-cycle-frame.ts';

export function visitModule(
  state: CycleState,
  module: string,
  graph: Map<string, string[]>,
): void {
  const stack = [
    createCycleFrame(module),
  ];

  while (stack.length) {
    processCycleFrame(state, stack, graph);
  }
}
