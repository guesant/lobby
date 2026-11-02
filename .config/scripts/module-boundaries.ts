import {
  moduleDependencies,
  modulesIn,
  resolveDependency,
} from './module-dependencies.ts';
import { dependencyViolations } from './module-policy.ts';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import ts from 'typescript';

export function moduleCycles(graph: Map<string, string[]>): string[][] {
  const visited = new Set<string>();

  const active: string[] = [];

  const cycles: string[][] = [];

  function visit(module: string): void {
    const start = active.indexOf(module);

    if (start >= 0) {
      cycles.push([
        ...active.slice(start),
        module,
      ]);

      return;
    }

    if (visited.has(module)) {
      return;
    }

    active.push(module);

    for (const dependency of graph.get(module) ?? []) {
      visit(dependency);
    }

    active.pop();
    visited.add(module);
  }

  for (const module of graph.keys()) {
    visit(module);
  }

  return cycles;
}

function projectOptions(): ts.CompilerOptions {
  const configuration = ts.readConfigFile(
    resolve('website/tsconfig.json'),
    ts.sys.readFile.bind(ts.sys),
  );

  if (configuration.error) {
    throw new Error('Cannot read website TypeScript configuration');
  }

  const value: unknown = configuration.config;

  if (!value || typeof value !== 'object') {
    throw new Error('Invalid TypeScript configuration');
  }

  return ts.parseJsonConfigFileContent(value, ts.sys, resolve('website'))
    .options;
}

async function dependencyGraph(): Promise<Map<string, string[]>> {
  const root = resolve('website/src');

  const context = {
    root,
    options: projectOptions(),
  };

  const graph = new Map<string, string[]>();

  const files = [
    ...(await modulesIn(root)),
    ...(await modulesIn(resolve('.config/scripts'))),
    ...(await modulesIn(resolve('.config/eslint-rules'))),
  ];

  for (const file of files) {
    const imports = moduleDependencies(
      await readFile(file, 'utf8'),
      file.endsWith('.svelte'),
    );

    const violations = dependencyViolations(file, imports);

    if (violations.length) {
      throw new Error(violations.join('\n'));
    }

    graph.set(
      file,
      imports.flatMap((dependency): string[] => {
        const candidate = resolveDependency(
          dependency.specifier,
          file,
          context,
        );

        if (!candidate || candidate.includes('/node_modules/')) {
          return [];
        }

        return [
          candidate,
        ];
      }),
    );
  }

  return graph;
}

async function checkModules(): Promise<void> {
  const cycles = moduleCycles(await dependencyGraph());

  if (cycles.length) {
    throw new Error(
      `Module cycles:\n${cycles
        .map((cycle): string => {
          return cycle.join(' -> ');
        })
        .join('\n')}`,
    );
  }
}

if (import.meta.main) {
  await checkModules();
}
