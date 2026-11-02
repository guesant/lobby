import { collectModuleDependencies } from './collect-module-dependencies.ts';
import { moduleFiles } from './module-files.ts';

export async function dependencyGraph(): Promise<Map<string, string[]>> {
  const graph = new Map<string, string[]>();

  for (const file of await moduleFiles()) {
    const dependencies = await collectModuleDependencies(file);

    graph.set(file, dependencies);
  }

  return graph;
}
