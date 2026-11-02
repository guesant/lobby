import type { Dependency } from './dependency.types.ts';
import { nodeDependency } from './node-dependency.ts';
import type ts from 'typescript';

export function collectNodeDependencies(
  node: ts.Node,
  dependencies: Dependency[],
): void {
  const dependency = nodeDependency(node);

  if (dependency) {
    dependencies.push(dependency);
  }

  for (const child of node.getChildren()) {
    collectNodeDependencies(child, dependencies);
  }
}
