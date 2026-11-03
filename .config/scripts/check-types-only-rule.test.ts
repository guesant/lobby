import typesOnly from '../eslint-rules/types-only.ts';
import typescriptParser from '@typescript-eslint/parser';
import { RuleTester } from 'eslint';
import svelteParser from 'svelte-eslint-parser';

const typescript = new RuleTester({
  languageOptions: {
    parser: typescriptParser,
    sourceType: 'module',
  },
});

const svelte = new RuleTester({
  languageOptions: {
    parser: svelteParser,
    parserOptions: {
      parser: typescriptParser,
    },
    sourceType: 'module',
  },
});

typescript.run('types-only', typesOnly, {
  valid: [
    {
      code: 'export type Record = { id: string };',
      filename: 'record.types.ts',
    },
    {
      code: "import type { Base } from './base.types.ts'; export interface Item extends Base {}",
      filename: 'item.types.ts',
    },
    {
      code: "export { type Record } from './record.types.ts';",
      filename: 'record-barrel.types.ts',
    },
    {
      code: "export type * from './shared.types.ts';",
      filename: 'shared-barrel.types.ts',
    },
    {
      code: 'declare global { interface Window { ready: boolean } }',
      filename: 'app.d.ts',
    },
    {
      code: 'const value = true;',
      filename: 'runtime.model.ts',
    },
  ],
  invalid: [
    {
      code: 'type Record = { id: string };',
      filename: 'record.model.ts',
      errors: [
        {
          messageId: 'declaration',
        },
      ],
    },
    {
      code: "export type { Record } from './record.types.ts';",
      filename: 'record.model.ts',
      errors: [
        {
          messageId: 'export',
        },
      ],
    },
    {
      code: "export type * from './record.types.ts';",
      filename: 'record.model.ts',
      errors: [
        {
          messageId: 'export',
        },
      ],
    },
    {
      code: "import './register-runtime.ts'; export type Record = string;",
      filename: 'record.types.ts',
      errors: [
        {
          messageId: 'runtime',
        },
      ],
    },
    {
      code: 'export const value = true; export type Record = string;',
      filename: 'record.types.ts',
      errors: [
        {
          messageId: 'runtime',
        },
      ],
    },
    {
      code: "export * from './runtime.ts';",
      filename: 'record.types.ts',
      errors: [
        {
          messageId: 'runtime',
        },
      ],
    },
  ],
});

svelte.run('types-only Svelte', typesOnly, {
  valid: [],
  invalid: [
    {
      code: '<script lang="ts">interface Props { title: string }</script>',
      filename: 'Card.svelte',
      errors: [
        {
          messageId: 'declaration',
        },
      ],
    },
  ],
});
