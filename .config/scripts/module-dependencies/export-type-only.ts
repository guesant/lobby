import ts from 'typescript';

export function exportTypeOnly(node: ts.ExportDeclaration): boolean {
  if (node.isTypeOnly) {
    return true;
  }

  const clause = node.exportClause;

  if (!clause || !ts.isNamedExports(clause) || !clause.elements.length) {
    return false;
  }

  for (const entry of clause.elements) {
    if (!entry.isTypeOnly) {
      return false;
    }
  }

  return true;
}
