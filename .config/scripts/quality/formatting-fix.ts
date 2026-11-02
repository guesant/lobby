import type { Linter } from 'eslint';

export function formattingFix(message: Linter.LintMessage): boolean {
  const rule = message.ruleId ?? '';

  return (
    rule.startsWith('@stylistic/') ||
    rule.startsWith('simple-import-sort/') ||
    [
      'import-x/first',
      'svelte/indent',
      'lobby/multiline-structures',
      'lobby/svelte-top-level-spacing',
      'lobby/svelte-import-first',
      'lobby/block-directive-newline',
    ].includes(rule)
  );
}
