import type { Rule } from 'eslint';

type FunctionNode = {
  id?: {
    name?: string;
    type?: string;
  } | null;
  parent?: FunctionNode;
  init?: FunctionNode | null;
  kind?: string;
  loc: {
    end: {
      column: number;
      line: number;
    };
    start: {
      column: number;
      line: number;
    };
  };
  type: string;
  value?: FunctionNode;
};

function moduleScoped(node: FunctionNode): boolean {
  let current = node.parent;

  while (
    current?.type === 'ExportNamedDeclaration' ||
    current?.type === 'ExportDefaultDeclaration'
  ) {
    current = current.parent;
  }

  return current?.type === 'Program' || current?.type === 'SvelteScriptElement';
}

function arrowDeclarator(node: FunctionNode): FunctionNode | undefined {
  const declarator = node.parent;

  if (
    node.type !== 'ArrowFunctionExpression' ||
    declarator?.type !== 'VariableDeclarator' ||
    declarator.init !== node ||
    declarator.id?.type !== 'Identifier'
  ) {
    return undefined;
  }

  return declarator;
}

function constArrow(node: FunctionNode): boolean {
  const declarator = arrowDeclarator(node);

  return (
    declarator !== undefined &&
    declarator.parent?.type === 'VariableDeclaration' &&
    declarator.parent.kind === 'const' &&
    moduleScoped(declarator.parent)
  );
}

function namedDeclaration(node: FunctionNode): boolean {
  return (
    node.type === 'FunctionDeclaration' &&
    typeof node.id?.name === 'string' &&
    moduleScoped(node)
  );
}

function allowedForm(node: FunctionNode): boolean {
  return namedDeclaration(node) || constArrow(node);
}

function classMethod(node: FunctionNode): boolean {
  const parent = node.parent;

  return (
    (parent?.type === 'MethodDefinition' ||
      parent?.type === 'TSAbstractMethodDefinition') &&
    parent.value === node
  );
}

function reportClassCount(
  context: Rule.RuleContext,
  node: FunctionNode,
  index: number,
): void {
  if (index > 0) {
    context.report({
      loc: node.loc,
      messageId: 'count',
    });
  }
}

function reportClassForm(context: Rule.RuleContext, node: FunctionNode): void {
  if (
    node.type !== 'ClassDeclaration' ||
    typeof node.id?.name !== 'string' ||
    !moduleScoped(node)
  ) {
    context.report({
      loc: node.loc,
      messageId: 'form',
    });
  }
}

function reportClassDeclarations(
  context: Rule.RuleContext,
  classes: FunctionNode[],
): void {
  for (const [
    index,
    node,
  ] of classes.entries()) {
    reportClassCount(context, node, index);
    reportClassForm(context, node);
  }
}

function reportStandaloneFunctions(
  context: Rule.RuleContext,
  classes: FunctionNode[],
  functions: FunctionNode[],
): void {
  if (classes.length === 0) {
    return;
  }

  for (const node of functions) {
    context.report({
      loc: node.loc,
      messageId: 'exclusive',
    });
  }
}

function reportClassFindings(
  context: Rule.RuleContext,
  classes: FunctionNode[],
  functions: FunctionNode[],
): void {
  reportClassDeclarations(context, classes);
  reportStandaloneFunctions(context, classes, functions);
}

const oneClassPerFile: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'require each class to occupy its own production source file',
    },
    schema: [],
    messages: {
      count: 'Move this class into a file of its own.',
      exclusive: 'Move this class to a file without standalone functions.',
      form: 'Use a top-level named class declaration.',
    },
  },
  create(context): Rule.RuleListener {
    const classes: FunctionNode[] = [];

    const functions: FunctionNode[] = [];

    return {
      ClassDeclaration(node): void {
        classes.push(node as unknown as FunctionNode);
      },
      ClassExpression(node): void {
        classes.push(node as unknown as FunctionNode);
      },
      FunctionDeclaration(node): void {
        functions.push(node as unknown as FunctionNode);
      },
      FunctionExpression(node): void {
        const functionNode = node as unknown as FunctionNode;

        if (!classMethod(functionNode)) {
          functions.push(functionNode);
        }
      },
      ArrowFunctionExpression(node): void {
        functions.push(node as unknown as FunctionNode);
      },
      'Program:exit'(): void {
        reportClassFindings(context, classes, functions);
      },
    };
  },
};

const oneFunctionPerFile: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'require one named function per production source file',
    },
    schema: [],
    messages: {
      count: 'Move this function into a file of its own.',
      form: 'Use a top-level named function or a top-level const arrow function.',
    },
  },
  create(context): Rule.RuleListener {
    const functions: FunctionNode[] = [];

    return {
      FunctionDeclaration(node): void {
        functions.push(node as unknown as FunctionNode);
      },
      FunctionExpression(node): void {
        const functionNode = node as unknown as FunctionNode;

        if (!classMethod(functionNode)) {
          functions.push(functionNode);
        }
      },
      ArrowFunctionExpression(node): void {
        functions.push(node as unknown as FunctionNode);
      },
      'Program:exit'(): void {
        for (const [
          index,
          node,
        ] of functions.entries()) {
          if (index > 0) {
            context.report({
              loc: node.loc,
              messageId: 'count',
            });
          }

          if (!allowedForm(node)) {
            context.report({
              loc: node.loc,
              messageId: 'form',
            });
          }
        }
      },
    };
  },
};

export default {
  rules: {
    'one-class-per-file': oneClassPerFile,
    'one-function-per-file': oneFunctionPerFile,
  },
};
