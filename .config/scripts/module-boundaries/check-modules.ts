import { dependencyGraph } from './dependency-graph.ts';
import { moduleCycles } from './module-cycles.ts';

export async function checkModules(): Promise<void> {
  const dependencies = await dependencyGraph();

  const cycles = moduleCycles(dependencies);

  if (cycles.length) {
    const messages: string[] = [];

    for (const cycle of cycles) {
      const message = cycle.join(' -> ');

      messages.push(message);
    }

    const cycleList = messages.join('\n');

    throw new Error(`Module cycles:\n${cycleList}`);
  }
}
