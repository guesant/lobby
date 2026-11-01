import type { Rule } from 'eslint';
import type { AST } from 'svelte-eslint-parser';

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

const topLevelSpacing: Rule.RuleModule = {
  meta: {
    type: 'layout',
    fixable: 'whitespace',
    schema: [],
    messages: {
      spacing: 'Separate declarations and control flow; keep imports grouped.',
    },
  },
  create(context: Rule.RuleContext): Rule.RuleListener {
    return {
      SvelteScriptElement(node: AST.SvelteScriptElement): void {
        for (let index = 1; index < node.body.length; index += 1) {
          const previous = node.body[index - 1];

          const current = node.body[index];

          if (!previous || !current) {
            continue;
          }

          const previousRange = previous.range;

          const currentRange = current.range;

          const previousLocation = previous.loc;

          const currentLocation = current.loc;

          if (
            !previousRange ||
            !currentRange ||
            !previousLocation ||
            !currentLocation
          ) {
            throw new Error(
              'Svelte script nodes must retain source ranges and locations',
            );
          }

          const previousImport = previous.type === 'ImportDeclaration';

          const groupedImports =
            previousImport && current.type === 'ImportDeclaration';

          if (
            !groupedImports &&
            !previousImport &&
            !separated.has(previous.type) &&
            !separated.has(current.type)
          ) {
            continue;
          }

          const gap = context.sourceCode.text.slice(
            previousRange[1],
            currentRange[0],
          );

          if (!/^\s*$/.test(gap)) {
            continue;
          }

          const blank =
            currentLocation.start.line - previousLocation.end.line > 1;

          if (groupedImports === !blank) {
            continue;
          }

          context.report({
            loc: currentLocation,
            messageId: 'spacing',
            fix(fixer: Rule.RuleFixer): Rule.Fix {
              let newline = '\n\n';

              if (groupedImports) {
                newline = '\n';
              }

              const indent =
                context.sourceCode.text
                  .slice(
                    context.sourceCode.text.lastIndexOf(
                      '\n',
                      currentRange[0] - 1,
                    ) + 1,
                    currentRange[0],
                  )
                  .match(/^\s*/)?.[0] || '';

              return fixer.replaceTextRange(
                [
                  previousRange[1],
                  currentRange[0],
                ],
                newline + indent,
              );
            },
          });
        }
      },
    };
  },
};

export default {
  rules: {
    'svelte-top-level-spacing': topLevelSpacing,
  },
};
