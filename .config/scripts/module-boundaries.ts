import ts from 'typescript';
import { parseForESLint } from 'svelte-eslint-parser';
import typescriptParser from '@typescript-eslint/parser';
import { existsSync } from 'node:fs';
import { readFile, readdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

type Dependency = {
  specifier: string;
  typeOnly: boolean;
};

function importTypeOnly(clause: ts.ImportClause | undefined): boolean {
  if (!clause) {
    return false;
  }

  if (clause.isTypeOnly) {
    return true;
  }

  const bindings = clause.namedBindings;

  if (
    clause.name ||
    !bindings ||
    !ts.isNamedImports(bindings) ||
    !bindings.elements.length
  ) {
    return false;
  }

  return bindings.elements.every((entry): boolean => {
    return entry.isTypeOnly;
  });
}

function exportTypeOnly(node: ts.ExportDeclaration): boolean {
  if (node.isTypeOnly) {
    return true;
  }

  const clause = node.exportClause;

  if (!clause || !ts.isNamedExports(clause) || !clause.elements.length) {
    return false;
  }

  return clause.elements.every((entry): boolean => {
    return entry.isTypeOnly;
  });
}

function nodeDependency(node: ts.Node): Dependency | undefined {
  if (
    ts.isImportDeclaration(node) &&
    ts.isStringLiteral(node.moduleSpecifier)
  ) {
    return {
      specifier: node.moduleSpecifier.text,
      typeOnly: importTypeOnly(node.importClause),
    };
  }

  if (
    ts.isExportDeclaration(node) &&
    node.moduleSpecifier &&
    ts.isStringLiteral(node.moduleSpecifier)
  ) {
    return {
      specifier: node.moduleSpecifier.text,
      typeOnly: exportTypeOnly(node),
    };
  }

  if (
    ts.isCallExpression(node) &&
    node.expression.kind === ts.SyntaxKind.ImportKeyword
  ) {
    const argument = node.arguments[0];

    if (argument && ts.isStringLiteral(argument)) {
      return {
        specifier: argument.text,
        typeOnly: false,
      };
    }
  }

  return undefined;
}

function resolveDependency(
  specifier: string,
  file: string,
  root: string,
  options: ts.CompilerOptions,
): string | undefined {
  let target: string | undefined;

  if (specifier.startsWith('$lib/')) {
    target = resolve(root, 'lib', specifier.slice(5));
  } else if (specifier.startsWith('.')) {
    target = resolve(dirname(file), specifier);
  }

  if (!target) {
    return undefined;
  }

  if (target.endsWith('.svelte') && existsSync(target)) {
    return target;
  }

  return ts.resolveModuleName(specifier, file, options, ts.sys).resolvedModule
    ?.resolvedFileName;
}

export function runtimeImports(
  source: string,
  component: boolean = false,
): string[] {
  let script = source;

  if (component) {
    const parsed = parseForESLint(source, {
      parser: typescriptParser,
      sourceType: 'module',
    });

    script = parsed.ast.body
      .flatMap((block): string[] => {
        if (block.type !== 'SvelteScriptElement' || !block.endTag) {
          return [];
        }

        return [
          source.slice(block.startTag.range[1], block.endTag.range[0]),
        ];
      })
      .join('\n');
  }

  const ast = ts.createSourceFile(
    'module.ts',
    script,
    ts.ScriptTarget.Latest,
    true,
  );

  const dependencies: Dependency[] = [];

  const inspect = (node: ts.Node): void => {
    const dependency = nodeDependency(node);

    if (dependency) {
      dependencies.push(dependency);
    }

    ts.forEachChild(node, inspect);
  };

  inspect(ast);

  return dependencies
    .filter((entry): boolean => {
      return !entry.typeOnly;
    })
    .map((entry): string => {
      return entry.specifier;
    });
}

async function modulesIn(directory: string): Promise<string[]> {
  const files: string[] = [];

  for (const entry of await readdir(directory, {
    withFileTypes: true,
  })) {
    const file = resolve(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await modulesIn(file)));
    } else if (
      /\.(?:[cm]?[jt]s|svelte)$/.test(entry.name) &&
      !entry.name.endsWith('.d.ts')
    ) {
      files.push(file);
    }
  }

  return files;
}

export function runtimeCycles(graph: Map<string, string[]>): string[][] {
  const visited = new Set<string>();

  const active: string[] = [];

  const cycles: string[][] = [];

  const visit = (module: string): void => {
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

    for (const dependency of graph.get(module) || []) {
      visit(dependency);
    }

    active.pop();
    visited.add(module);
  };

  for (const module of graph.keys()) {
    visit(module);
  }

  return cycles;
}

async function checkModules(): Promise<void> {
  const root = resolve('website/src');

  const configuration = ts.readConfigFile(
    resolve('website/tsconfig.json'),
    ts.sys.readFile,
  );

  if (configuration.error) {
    throw new Error('Cannot read website TypeScript configuration');
  }

  const value: unknown = configuration.config;

  if (!value || typeof value !== 'object') {
    throw new Error('Invalid TypeScript configuration');
  }

  const project = ts.parseJsonConfigFileContent(
    value,
    ts.sys,
    resolve('website'),
  );

  const graph = new Map<string, string[]>();

  for (const file of await modulesIn(root)) {
    const dependencies: string[] = [];

    for (const specifier of runtimeImports(
      await readFile(file, 'utf8'),
      file.endsWith('.svelte'),
    )) {
      const candidate = resolveDependency(
        specifier,
        file,
        root,
        project.options,
      );

      if (candidate) {
        dependencies.push(candidate);
      }
    }

    graph.set(file, dependencies);
  }

  const cycles = runtimeCycles(graph);

  if (cycles.length) {
    throw new Error(
      `Runtime module cycles:\n${cycles
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
