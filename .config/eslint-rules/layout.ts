import type { Rule } from 'eslint';
import type { SourceLocation } from 'estree';

type SyntaxNode = {
  type: string;
  range: [
    number,
    number,
  ];
  loc: SourceLocation;
  [key: string]: unknown;
};

type Edit = {
  range: [
    number,
    number,
  ];
  text: string;
};

function syntaxNode(value: unknown): value is SyntaxNode {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    'range' in value &&
    Array.isArray(value.range) &&
    'loc' in value
  );
}

function indentAt(source: string, offset: number): string {
  const start = source.lastIndexOf('\n', offset - 1) + 1;

  return /^\s*/.exec(source.slice(start, offset))?.[0] ?? '';
}

function closingDelimiter(
  value: SyntaxNode,
  source: Rule.RuleContext['sourceCode'],
): number {
  if (syntaxNode(value['typeAnnotation'])) {
    const annotation = source.getTokenByRangeStart(
      value['typeAnnotation'].range[0],
    );

    if (annotation) {
      const delimiter = source.getTokenBefore(annotation);

      if (delimiter && (delimiter.value === '}' || delimiter.value === ']')) {
        return delimiter.range[0];
      }
    }
  }

  return value.range[1] - 1;
}

function memberEdits(
  children: SyntaxNode[],
  source: string,
  indent: string,
): Edit[] {
  const edits: Edit[] = [];

  for (let index = 1; index < children.length; index += 1) {
    const previous = children[index - 1];

    const child = children[index];

    if (!previous || previous.loc.end.line !== child?.loc.start.line) {
      continue;
    }

    const gap = source.slice(previous.range[1], child.range[0]);

    if (!/^[,;\s]*$/.test(gap)) {
      continue;
    }

    edits.push({
      range: [
        previous.range[1],
        child.range[0],
      ],
      text: `${gap.trimEnd()}\n${indent}  `,
    });
  }

  return edits;
}

function structureEdits(
  value: SyntaxNode,
  children: SyntaxNode[],
  context: Rule.RuleContext,
): Edit[] {
  const first = children[0];

  const last = children.at(-1);

  if (!first || !last) {
    return [];
  }

  const source = context.sourceCode.text;

  const indent = indentAt(source, value.range[0]);

  const ranges = memberEdits(children, source, indent);

  const open = value.range[0] + 1;

  if (
    value.loc.start.line === first.loc.start.line &&
    /^\s*$/.test(source.slice(open, first.range[0]))
  ) {
    ranges.push({
      range: [
        open,
        first.range[0],
      ],
      text: `\n${indent}  `,
    });
  }

  const close = closingDelimiter(value, context.sourceCode);

  const tail = source.slice(last.range[1], close);

  if (!tail.includes('\n') && /^[,;\s]*$/.test(tail)) {
    ranges.push({
      range: [
        last.range[1],
        close,
      ],
      text: `${tail.trimEnd()}\n${indent}`,
    });
  }

  return ranges;
}

export const multilineStructures: Rule.RuleModule = {
  meta: {
    type: 'layout',
    fixable: 'whitespace',
    schema: [],
    messages: {
      multiline: 'Nonempty structures must have one member per line.',
    },
  },
  create(context: Rule.RuleContext): Rule.RuleListener {
    function inspect(value: unknown): void {
      if (!syntaxNode(value)) {
        return;
      }

      const raw =
        value['properties'] ??
        value['members'] ??
        value['body'] ??
        value['elements'] ??
        value['elementTypes'];

      if (!Array.isArray(raw)) {
        return;
      }

      const ranges = structureEdits(value, raw.filter(syntaxNode), context);

      if (!ranges.length) {
        return;
      }

      context.report({
        loc: value.loc,
        messageId: 'multiline',
        fix(fixer: Rule.RuleFixer): Rule.Fix[] {
          return ranges.map((change): Rule.Fix => {
            return fixer.replaceTextRange(change.range, change.text);
          });
        },
      });
    }

    return {
      ObjectExpression: inspect,
      ObjectPattern: inspect,
      TSTypeLiteral: inspect,
      TSInterfaceBody: inspect,
      ArrayExpression: inspect,
      ArrayPattern: inspect,
      TSTupleType: inspect,
    };
  },
};
