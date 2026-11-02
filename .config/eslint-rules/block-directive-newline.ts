import type { SvelteRule, SvelteRuleListener } from './svelte-rule.types.ts';
import type { Rule } from 'eslint';
import type { AST } from 'svelte-eslint-parser';

type SyntaxToken = {
  type: string;
  value: string;
  range: [
    number,
    number
  ]
};

type Range = [
  number,
  number
];

const inlineContainers = new Set([
  'a',
  'p',
  'span',
  'strong',
  'em',
  'code',
  'pre',
  'textarea',
  'label',
  'button',
  'summary',
  'kbd',
  'time',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
]);

function directiveEnd(tokens: SyntaxToken[], start: number): number | undefined {
  let depth = 0;

  for (let index = start; index < tokens.length; index += 1) {
    const token = tokens[index];

    if (token?.type !== 'Punctuator') {
      continue;
    }

    if (token.value === '{') {
      depth += 1;
    }

    if (token.value === '}') {
      depth -= 1;

      if (depth === 0) {
        return index;
      }
    }
  }

  return undefined;
}

function significantText(token: SyntaxToken | undefined): boolean {
  return token?.type === 'HTMLText' && token.value.trim().length > 0;
}

function directiveStart(token: SyntaxToken | undefined, keyword: SyntaxToken | undefined): boolean {
  return token?.value === '{' && keyword?.type === 'MustacheKeyword' && /^[#:/](?:if|else|each|await|then|catch|key|snippet)$/.test(keyword.value);
}

function preservesBoundary(text: string, adjacent: string | undefined): boolean {
  return !text.trim() || /\s/.test(adjacent ?? '');
}

function safeDirective(
  range: Range,
  sensitive: Range[],
  neighbors: [
    SyntaxToken | undefined,
    SyntaxToken | undefined
  ],
): boolean {
  return !sensitive.some((container): boolean => {
    return container[0] <= range[0] && container[1] >= range[1];
  }) && !neighbors.some(significantText);
}

function reportDirective(
  context: Rule.RuleContext,
  range: Range,
  safe: boolean,
): void {
  const source = context.sourceCode.text;

  const lineStart = source.lastIndexOf('\n', range[0] - 1) + 1;

  const nextLine = source.indexOf('\n', range[1]);

  let lineEnd = nextLine;

  if (lineEnd < 0) {
    lineEnd = source.length;
  }

  const before = source.slice(lineStart, range[0]);

  const after = source.slice(range[1], lineEnd);

  const preservesWhitespace = preservesBoundary(before, source[range[0] - 1]) && preservesBoundary(after, source[range[1]]);

  if (!before.trim() && !after.trim()) {
    return;
  }

  context.report({
    loc: context.sourceCode.getLocFromIndex(range[0]),
    messageId: 'newline',
    fix(fixer): Rule.Fix[] | null {
      if (!safe || !preservesWhitespace) {
        return null;
      }

      const indent = (/^\s*/.exec(before))?.[0] ?? '';

      const fixes: Rule.Fix[] = [];

      if (before.trim()) {
        fixes.push(fixer.insertTextBeforeRange(range, `\n${indent}`));
      }

      if (after.trim()) {
        fixes.push(fixer.insertTextAfterRange(range, `\n${indent}`));
      }

      return fixes;
    },
  });
}

function inspectDirectives(
  context: Rule.RuleContext,
  tokens: SyntaxToken[],
  sensitive: Range[],
): void {
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];

    const keyword = tokens[index + 1];

    if (!token || !directiveStart(token, keyword)) {
      continue;
    }

    const end = directiveEnd(tokens, index);

    const last = tokens[end ?? -1];

    if (end === undefined || !last) {
      continue;
    }

    const range: Range = [
      token.range[0],
      last.range[1]
    ];

    const neighbors: [
      SyntaxToken | undefined,
      SyntaxToken | undefined
    ] = [
      tokens[index - 1],
      tokens[end + 1],
    ];

    reportDirective(context, range, safeDirective(range, sensitive, neighbors));
    index = end;
  }
}

export const blockDirectiveNewline: SvelteRule = {
  meta: {
    type: 'layout',
    fixable: 'whitespace',
    schema: [],
    messages: {
      newline: 'Put each structural Svelte directive on its own line.'
    },
  },
  create(context): SvelteRuleListener {
    const sensitive: Range[] = [];

    return {
      SvelteElement(node: AST.SvelteElement): void {
        if (node.name.type === 'SvelteName' && inlineContainers.has(node.name.name)) {
          sensitive.push(node.range);
        }
      },
      'Program:exit'(): void {
        inspectDirectives(context, context.sourceCode.getTokens(context.sourceCode.ast), sensitive);
      },
    };
  },
};
