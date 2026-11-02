import type { Dependency } from './dependency.types.ts';
import ts from 'typescript';

export function typeDependency(node: ts.Node): Dependency | undefined {
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
