import type { SvelteRule, SvelteRuleListener } from './svelte-rule.types.ts';
import type { Rule } from 'eslint';
import type { AST } from 'svelte-eslint-parser';

type ScriptStatement = AST.SvelteScriptElement['body'][number];

const separated = new Set([
  'VariableDeclaration',
  'FunctionDeclaration',
  'ClassDeclaration',
  'IfStatement',
  'SwitchStatement',
  'ForStatement',
  'ForInStatement',
  'ForOfStatement',
  'WhileStatement',
  'DoWhileStatement',
  'TryStatement',
  'BlockStatement',
  'ExportNamedDeclaration',
  'ExportDefaultDeclaration',
  'ExportAllDeclaration',
  'TSTypeAliasDeclaration',
  'TSInterfaceDeclaration',
  'TSEnumDeclaration',
  'ReturnStatement',
  'ThrowStatement',
]);

function reexport(statement: ScriptStatement): boolean {
  if (statement.type === 'ExportAllDeclaration') {
    return true;
  }

  return (
    statement.type === 'ExportNamedDeclaration' && statement.source !== null
  );
}

function spacingKind(
  previous: ScriptStatement,
  current: ScriptStatement,
): 'grouped' | 'separated' | undefined {
  if (
    previous.type === 'ImportDeclaration' &&
    current.type === 'ImportDeclaration'
  ) {
    return 'grouped';
  }

  if (reexport(previous) && reexport(current)) {
    return 'grouped';
  }

  if (
    previous.type === 'ImportDeclaration' ||
    separated.has(previous.type) ||
    separated.has(current.type)
  ) {
    return 'separated';
  }

  return undefined;
}

function inspectSpacing(
  context: Rule.RuleContext,
  previous: ScriptStatement,
  current: ScriptStatement,
): void {
  const kind = spacingKind(previous, current);

  if (
    !kind ||
    !previous.range ||
    !current.range ||
    !previous.loc ||
    !current.loc
  ) {
    return;
  }

  const range: [
    number,
    number,
  ] = [
    previous.range[1],
    current.range[0],
  ];

  const gap = context.sourceCode.text.slice(...range);

  if (
    !/^\s*$/.test(gap) ||
    current.loc.start.line - previous.loc.end.line > 1 ===
      (kind === 'separated')
  ) {
    return;
  }

  context.report({
    loc: current.loc,
    messageId: 'spacing',
    fix(fixer): Rule.Fix {
      let newline = '\n';

      if (kind === 'separated') {
        newline = '\n\n';
      }

      const line = context.sourceCode.text.slice(
        context.sourceCode.text.lastIndexOf('\n', range[1] - 1) + 1,
        range[1],
      );

      return fixer.replaceTextRange(
        range,
        newline + (/^[\t ]*/.exec(line)?.[0] ?? ''),
      );
    },
  });
}

function inspectImports(
  context: Rule.RuleContext,
  node: AST.SvelteScriptElement,
): void {
  let seenStatement = false;

  const imports = node.body.filter((statement): boolean => {
    return statement.type === 'ImportDeclaration';
  });

  for (const statement of node.body) {
    if (statement.type !== 'ImportDeclaration') {
      seenStatement = true;

      continue;
    }

    if (!seenStatement) {
      continue;
    }

    context.report({
      loc: context.sourceCode.getLocFromIndex(statementRange(statement)[0]),
      messageId: 'first',
      fix(fixer): Rule.Fix[] | null {
        if (context.sourceCode.getAllComments().length) {
          return null;
        }

        return [
          fixer.insertTextAfterRange(
            node.startTag.range,
            '\n' +
              imports
                .map((item): string => {
                  return context.sourceCode.text.slice(...statementRange(item));
                })
                .join('\n') +
              '\n\n',
          ),
          ...imports.map((item): Rule.Fix => {
            return fixer.removeRange(statementRange(item));
          }),
        ];
      },
    });

    return;
  }
}

function statementRange(node: ScriptStatement): [
  number,
  number,
] {
  if (!node.range) {
    throw new Error('Script statements must retain source ranges');
  }

  return node.range;
}

const topLevelSpacing: SvelteRule = {
  meta: {
    type: 'layout',
    fixable: 'whitespace',
    schema: [],
    messages: {
      spacing: 'Separate declarations and control flow; keep imports grouped.',
    },
  },
  create(context): SvelteRuleListener {
    return {
      SvelteScriptElement(node: AST.SvelteScriptElement): void {
        for (let index = 1; index < node.body.length; index += 1) {
          const previous = node.body[index - 1];

          const current = node.body[index];

          if (previous && current) {
            inspectSpacing(context, previous, current);
          }
        }
      },
    };
  },
};

const importFirst: SvelteRule = {
  meta: {
    type: 'layout',
    fixable: 'code',
    schema: [],
    messages: {
      first: 'Keep one import block before all other script statements.',
    },
  },
  create(context): SvelteRuleListener {
    return {
      SvelteScriptElement(node: AST.SvelteScriptElement): void {
        inspectImports(context, node);
      },
    };
  },
};

export default {
  rules: {
    'svelte-top-level-spacing': topLevelSpacing,
    'svelte-import-first': importFirst,
  },
};
