import type { CycleFrame } from './cycle-state.types.ts';

export function nextCycleDependency(
  frame: CycleFrame,
  graph: Map<string, string[]>,
): string | undefined {
  const dependency = graph.get(frame.module)?.[frame.dependencyIndex];

  frame.dependencyIndex += 1;

  return dependency;
}
