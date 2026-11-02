import ts from 'typescript';

export function namedBindingsTypeOnly(
  bindings: ts.NamedImportBindings | undefined,
): boolean {
  if (!bindings || !ts.isNamedImports(bindings) || !bindings.elements.length) {
    return false;
  }

  for (const entry of bindings.elements) {
    if (!entry.isTypeOnly) {
      return false;
    }
  }

  return true;
}
