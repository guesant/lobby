import type { Dependency } from './dependency.types.ts';
import { exportTypeOnly } from './export-type-only.ts';
import { importTypeOnly } from './import-type-only.ts';
import ts from 'typescript';

export function declarationDependency(node: ts.Node): Dependency | undefined {
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
