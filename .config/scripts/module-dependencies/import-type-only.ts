import { namedBindingsTypeOnly } from './named-bindings-type-only.ts';
import ts from 'typescript';

export function importTypeOnly(clause: ts.ImportClause | undefined): boolean {
  if (!clause) {
    return false;
  }

  if (clause.phaseModifier === ts.SyntaxKind.TypeKeyword) {
    return true;
  }

  return !clause.name && namedBindingsTypeOnly(clause.namedBindings);
}
