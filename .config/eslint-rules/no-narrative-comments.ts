import type { Rule } from 'eslint';
import type { SourceLocation } from 'estree';

const toolDirectivePattern =
  /^(?:eslint-(?:disable-next-line|disable-line|enable)\s+[\w@/-]+|@ts-expect-error\s*:|prettier-ignore|istanbul\s+ignore|c8\s+ignore|v8\s+ignore|jscpd:ignore-(?:start|end)|nosemgrep|semgrep:)(?:\b|:|\s)/;

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'disallow narrative comments in Svelte components',
    },
    schema: [],
    messages: {
      narrative:
        'Narrative comments are not allowed; use tool directives only.',
    },
  },
  create(context: Rule.RuleContext): Rule.RuleListener {
    const checkComment = (
      value: string,
      loc: SourceLocation | null | undefined,
    ): void => {
      if (!loc) {
        throw new Error('Missing comment location');
      }

      if (!toolDirectivePattern.test(value.trim())) {
        context.report({
          loc,
          messageId: 'narrative',
        });
      }
    };

    return {
      Program(): void {
        for (const comment of context.sourceCode.getAllComments()) {
          checkComment(comment.value, comment.loc);
        }
      },
      SvelteHTMLComment(node: unknown): void {
        if (
          typeof node !== 'object' ||
          node === null ||
          !('value' in node) ||
          typeof node.value !== 'string' ||
          !('loc' in node)
        ) {
          throw new Error('Invalid Svelte comment node');
        }

        const loc = node.loc as SourceLocation;

        checkComment(node.value, loc);
      },
    };
  },
} satisfies Rule.RuleModule;
