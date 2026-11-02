import type { Rule } from 'eslint';

type SyntaxNode = {
  [key: string]: unknown;
  type: string;
};

type VisitorKeys = Record<string, string[]>;

const functionNodes = new Set([
  'ArrowFunctionExpression',
  'FunctionDeclaration',
  'FunctionExpression',
]);

function syntaxNode(value: unknown): value is SyntaxNode {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    typeof value.type === 'string'
  );
}

function childContainsCall(value: unknown, visitorKeys: VisitorKeys): boolean {
  if (Array.isArray(value)) {
    return value.some((item: unknown): boolean => {
      return syntaxNode(item) && containsCall(item, visitorKeys);
    });
  }

  return syntaxNode(value) && containsCall(value, visitorKeys);
}

function containsCall(node: SyntaxNode, visitorKeys: VisitorKeys): boolean {
  if (node.type === 'CallExpression') {
    return true;
  }

  if (functionNodes.has(node.type)) {
    return false;
  }

  return (visitorKeys[node.type] ?? []).some((key: string): boolean => {
    return childContainsCall(node[key], visitorKeys);
  });
}

function hasNestedArgumentCall(
  node: SyntaxNode,
  visitorKeys: VisitorKeys,
): boolean {
  const argumentsList = node['arguments'];

  if (!Array.isArray(argumentsList)) {
    return false;
  }

  return argumentsList.some((argument: unknown): boolean => {
    return syntaxNode(argument) && containsCall(argument, visitorKeys);
  });
}

const noNestedCallArguments: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'disallow function calls nested inside call arguments',
    },
    schema: [],
    messages: {
      nested: 'Assign the inner call result before calling the outer function.',
    },
  },
  create(context): Rule.RuleListener {
    const visitorKeys = context.sourceCode.visitorKeys;

    return {
      CallExpression(node): void {
        const callNode = node as unknown as SyntaxNode;

        if (hasNestedArgumentCall(callNode, visitorKeys)) {
          context.report({
            node,
            messageId: 'nested',
          });
        }
      },
    };
  },
};

export default {
  rules: {
    'no-nested-call-arguments': noNestedCallArguments,
  },
};
