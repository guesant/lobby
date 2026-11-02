import type { CycleState } from './cycle-state.types.ts';

export function recordCycle(state: CycleState, dependency: string): void {
  const start = state.active.get(dependency);

  if (start === undefined) {
    return;
  }

  const cyclePath = state.path.slice(start);

  state.cycles.push([
    ...cyclePath,
    dependency,
  ]);
}
