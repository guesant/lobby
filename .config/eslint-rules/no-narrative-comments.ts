import type { SvelteRule, SvelteRuleListener } from './svelte-rule.types.ts';
import type { Rule } from 'eslint';
import type { Comment, SourceLocation } from 'estree';
import type { AST } from 'svelte-eslint-parser';

const toolDirectivePattern =
  /^(?:eslint-(?:disable-next-line|disable-line|enable)\s+[\w@/-]+|@ts-expect-error\s*:|prettier-ignore|istanbul\s+ignore|c8\s+ignore|v8\s+ignore|jscpd:ignore-(?:start|end)|nosemgrep|semgrep:)(?:\b|:|\s)/;

const essentialCommentPattern =
  /^(?:IMPORTANT:|SPDX-License-Identifier:|Copyright\b)/i;

function publicContractComment(
  comment: Comment,
  context: Rule.RuleContext,
): boolean {
  if (
    !comment.value.startsWith('*') ||
    !/@(?:param|returns|throws|remarks|example|typedef|type)\b/.test(
      comment.value,
    )
  ) {
    return false;
  }

  const next = context.sourceCode.getTokenAfter(comment);

  return next?.value === 'export';
}

function checkComment(
  context: Rule.RuleContext,
  value: string,
  loc: SourceLocation | null | undefined,
): void {
  if (!loc) {
    throw new Error('Missing comment location');
  }

  if (
    !toolDirectivePattern.test(value.trim()) &&
    !essentialCommentPattern.test(value.trim())
  ) {
    context.report({
      loc,
      messageId: 'narrative',
    });
  }
}

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'disallow narrative comments in Svelte components',
    },
    schema: [],
    messages: {
      narrative:
        'Use tool directives, legal notices, exported contract documentation or IMPORTANT invariants only.',
    },
  },
  create(context: Rule.RuleContext): SvelteRuleListener {
    return {
      Program(): void {
        for (const comment of context.sourceCode.getAllComments()) {
          if (!publicContractComment(comment, context)) {
            checkComment(context, comment.value, comment.loc);
          }
        }
      },
      SvelteHTMLComment(node: AST.SvelteHTMLComment): void {
        checkComment(context, node.value, node.loc);
      },
    };
  },
} satisfies SvelteRule;
