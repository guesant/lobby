import { createCycleState } from './create-cycle-state.ts';
import { visitModule } from './visit-module.ts';

export function moduleCycles(graph: Map<string, string[]>): string[][] {
  const state = createCycleState();

  for (const module of graph.keys()) {
    if (!state.visited.has(module)) {
      visitModule(state, module, graph);
    }
  }

  return state.cycles;
}
