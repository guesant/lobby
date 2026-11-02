import { collectNodeDependencies } from './collect-node-dependencies.ts';
import type { Dependency } from './dependency.types.ts';
import { svelteScript } from './svelte-script.ts';
import ts from 'typescript';

export function moduleDependencies(
  source: string,
  component = false,
): Dependency[] {
  let script = source;

  if (component) {
    script = svelteScript(source);
  }

  const ast = ts.createSourceFile(
    'module.ts',
    script,
    ts.ScriptTarget.Latest,
    true,
  );

  const dependencies: Dependency[] = [];

  collectNodeDependencies(ast, dependencies);

  return dependencies;
}
