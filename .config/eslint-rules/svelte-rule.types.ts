import type { Rule } from 'eslint';
import type { AST } from 'svelte-eslint-parser';

export type SvelteRuleListener = {
  [Node in Exclude<AST.SvelteNode, AST.SvelteProgram> as Node['type']]?: (
    node: Node,
  ) => void;
} & {
  Program?: () => void;
  'Program:exit'?: () => void;
};

export type SvelteRule = Omit<Rule.RuleModule, 'create'> & {
  create(context: Rule.RuleContext): SvelteRuleListener;
};
