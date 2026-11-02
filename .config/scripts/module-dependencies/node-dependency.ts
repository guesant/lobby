import { declarationDependency } from './declaration-dependency.ts';
import type { Dependency } from './dependency.types.ts';
import { typeDependency } from './type-dependency.ts';
import ts from 'typescript';

export function nodeDependency(node: ts.Node): Dependency | undefined {
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
