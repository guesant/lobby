import typescriptParser from '@typescript-eslint/parser';
import { existsSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { parseForESLint } from 'svelte-eslint-parser';
import ts from 'typescript';

export type Dependency = {
  specifier: string;
  typeOnly: boolean;
};

function importTypeOnly(clause: ts.ImportClause | undefined): boolean {
  if (!clause) {
    return false;
  }

  if (clause.phaseModifier === ts.SyntaxKind.TypeKeyword) {
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

function typeDependency(node: ts.Node): Dependency | undefined {
  if (
    ts.isImportTypeNode(node) &&
    ts.isLiteralTypeNode(node.argument) &&
    ts.isStringLiteral(node.argument.literal)
  ) {
    return {
      specifier: node.argument.literal.text,
      typeOnly: true,
    };
  }

  return undefined;
}

function declarationDependency(node: ts.Node): Dependency | undefined {
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

  return undefined;
}

function nodeDependency(node: ts.Node): Dependency | undefined {
  const declared = declarationDependency(node) ?? typeDependency(node);

  if (declared) {
    return declared;
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
    target = resolve(context.root, 'lib', specifier.slice(5));
  } else if (specifier.startsWith('.')) {
    target = resolve(dirname(file), specifier);
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

export function moduleDependencies(
  source: string,
  component = false,
): Dependency[] {
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

  function inspect(node: ts.Node): void {
    const dependency = nodeDependency(node);

    if (dependency) {
      dependencies.push(dependency);
    }

    ts.forEachChild(node, inspect);
  }

  inspect(ast);

  return dependencies;
}

export async function modulesIn(directory: string): Promise<string[]> {
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
