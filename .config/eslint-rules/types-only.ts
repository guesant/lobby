import type { TypeSyntaxNode } from './types-only.types.ts';
import type { Rule } from 'eslint';

function dedicatedTypeFile(filename: string): boolean {
  return /\.types\.(?:ts|mts|cts)$|\.d\.(?:ts|mts|cts)$/.test(filename);
}

function typeDeclaration(node: TypeSyntaxNode | undefined): boolean {
  return (
    node?.type === 'TSTypeAliasDeclaration' ||
    node?.type === 'TSInterfaceDeclaration'
  );
}

function typeImportSpecifier(node: TypeSyntaxNode): boolean {
  return node.importKind === 'type';
}

function typeExportSpecifier(node: TypeSyntaxNode): boolean {
  return node.exportKind === 'type';
}

function containsTypeExport(node: TypeSyntaxNode): boolean {
  if (node.exportKind === 'type') {
    return true;
  }

  return node.specifiers?.some(typeExportSpecifier) === true;
}

function typeOnlyImport(node: TypeSyntaxNode): boolean {
  if (node.type !== 'ImportDeclaration') {
    return false;
  }

  if (node.importKind === 'type') {
    return true;
  }

  if (!node.specifiers?.length) {
    return false;
  }

  return node.specifiers.every(typeImportSpecifier);
}

function typeOnlyExport(node: TypeSyntaxNode): boolean {
  if (node.type === 'ExportAllDeclaration') {
    return node.exportKind === 'type';
  }

  if (node.type !== 'ExportNamedDeclaration') {
    return false;
  }

  if (typeDeclaration(node.declaration ?? undefined)) {
    return true;
  }

  if (node.exportKind === 'type') {
    return true;
  }

  if (!node.specifiers?.length) {
    return false;
  }

  return node.specifiers.every(typeExportSpecifier);
}

function typeOnlyStatement(node: TypeSyntaxNode): boolean {
  if (typeOnlyImport(node) || typeOnlyExport(node)) {
    return true;
  }

  return typeDeclaration(node);
}

function reportRuntimeStatements(
  context: Rule.RuleContext,
  node: TypeSyntaxNode,
): void {
  for (const statement of node.body ?? []) {
    if (!typeOnlyStatement(statement)) {
      context.report({
        loc: statement.loc,
        messageId: 'runtime',
      });
    }
  }
}

function typeDeclarationListeners(
  context: Rule.RuleContext,
  dedicated: boolean,
): Rule.RuleListener {
  return {
    TSTypeAliasDeclaration(node: Rule.Node): void {
      if (!dedicated) {
        context.report({
          node,
          messageId: 'declaration',
        });
      }
    },
    TSInterfaceDeclaration(node: Rule.Node): void {
      if (!dedicated) {
        context.report({
          node,
          messageId: 'declaration',
        });
      }
    },
  };
}

function typeOnlyListeners(
  context: Rule.RuleContext,
  filename: string,
): Rule.RuleListener {
  const dedicated = dedicatedTypeFile(filename);

  return {
    ...typeDeclarationListeners(context, dedicated),
    ExportNamedDeclaration(node): void {
      const declaration = node as unknown as TypeSyntaxNode;

      if (
        !dedicated &&
        !declaration.declaration &&
        containsTypeExport(declaration)
      ) {
        context.report({
          node,
          messageId: 'export',
        });
      }
    },
    ExportAllDeclaration(node): void {
      const declaration = node as unknown as TypeSyntaxNode;

      if (!dedicated && containsTypeExport(declaration)) {
        context.report({
          node,
          messageId: 'export',
        });
      }
    },
    'Program:exit'(node): void {
      if (dedicated && !/\.d\.(?:ts|mts|cts)$/.test(filename)) {
        reportRuntimeStatements(context, node as unknown as TypeSyntaxNode);
      }
    },
  };
}

const typesOnly: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'keep named type declarations and type exports in type-only files',
    },
    schema: [],
    messages: {
      declaration: 'Move this type declaration to a dedicated .types.ts file.',
      export: 'Move this type export to a dedicated .types.ts file.',
      runtime: 'Type-only files cannot contain runtime code or imports.',
    },
  },
  create(context): Rule.RuleListener {
    return typeOnlyListeners(context, context.filename);
  },
};

export default typesOnly;
