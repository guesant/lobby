import {
  moduleDependencies,
  resolveDependency,
} from '../module-dependencies.ts';
import { dependencyViolations } from '../module-policy.ts';
import { projectOptions } from './project-options.ts';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

export async function collectModuleDependencies(
  file: string,
): Promise<string[]> {
  const source = await readFile(file, 'utf8');

  const isSvelte = file.endsWith('.svelte');

  const imports = moduleDependencies(source, isSvelte);

  const violations = dependencyViolations(file, imports);

  if (violations.length) {
    throw new Error(violations.join('\n'));
  }

  const context = {
    root: resolve('website/src'),
    options: projectOptions(),
  };

  const dependencies: string[] = [];

  for (const dependency of imports) {
    const candidate = resolveDependency(dependency.specifier, file, context);

    if (candidate && !candidate.includes('/node_modules/')) {
      dependencies.push(candidate);
    }
  }

  return dependencies;
}
