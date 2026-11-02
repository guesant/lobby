import typescriptParser from '@typescript-eslint/parser';
import { parseForESLint } from 'svelte-eslint-parser';

export function svelteScript(source: string): string {
  const parsed = parseForESLint(source, {
    parser: typescriptParser,
    sourceType: 'module',
  });

  let script = '';

  for (const block of parsed.ast.body) {
    if (block.type === 'SvelteScriptElement' && block.endTag) {
      script += `${source.slice(block.startTag.range[1], block.endTag.range[0])}\n`;
    }
  }

  return script;
}
