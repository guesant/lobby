import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import ts from 'typescript';

export function resolveDependency(
  specifier: string,
  file: string,
  context: {
    root: string;
    options: ts.CompilerOptions;
  },
): string | undefined {
  let target: string | undefined;

  if (specifier.startsWith('#lib/')) {
    const libraryPath = specifier.slice(5);

    target = resolve(context.root, 'lib', libraryPath);
  } else if (specifier.startsWith('.')) {
    const fileDirectory = dirname(file);

    target = resolve(fileDirectory, specifier);
  }

  if (!target) {
    return undefined;
  }

  if (target.endsWith('.svelte') && existsSync(target)) {
    return target;
  }

  return ts.resolveModuleName(specifier, file, context.options, ts.sys)
    .resolvedModule?.resolvedFileName;
}
