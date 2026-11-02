import {
  oneClassPerFile,
  oneFunctionPerFile,
} from '../eslint-rules/one-function-per-file.ts';
import typescriptParser from '@typescript-eslint/parser';
import { RuleTester } from 'eslint';
import svelteParser from 'svelte-eslint-parser';

const typescript = new RuleTester({
  languageOptions: {
    parser: typescriptParser,
    sourceType: 'module',
  },
});

typescript.run('one-function-per-file', oneFunctionPerFile, {
  valid: [
    'type Record = { id: string }; const records: Record[] = [];',
    'function load(): void {}',
    'const load = (): void => {};',
    'class Loader { load(): void {} save(): void {} }',
  ],
  invalid: [
    {
      code: 'function load(): void {} function save(): void {}',
      errors: [
        {
          messageId: 'count',
        },
      ],
    },
    {
      code: 'function load(): void { function save(): void {} }',
      errors: [
        {
          messageId: 'count',
        },
        {
          messageId: 'form',
        },
      ],
    },
    {
      code: 'const load = values.map((value) => value);',
      errors: [
        {
          messageId: 'form',
        },
      ],
    },
    {
      code: 'const load = function (): void {};',
      errors: [
        {
          messageId: 'form',
        },
      ],
    },
  ],
});

typescript.run('one-class-per-file', oneClassPerFile, {
  valid: [
    'class Loader { load(): void {} save(): void {} }',
    'export class Loader {}',
  ],
  invalid: [
    {
      code: 'class Loader {} class Saver {}',
      errors: [
        {
          messageId: 'count',
        },
      ],
    },
    {
      code: 'class Loader {} function load(): void {}',
      errors: [
        {
          messageId: 'exclusive',
        },
      ],
    },
    {
      code: 'const Loader = class {};',
      errors: [
        {
          messageId: 'form',
        },
      ],
    },
  ],
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

svelte.run('one-function-per-file Svelte', oneFunctionPerFile, {
  valid: [
    '<script lang="ts">function load(): void {}</script><p>Ready</p>',
  ],
  invalid: [
    {
      code: '<button onclick={() => {}}>Run</button>',
      errors: [
        {
          messageId: 'form',
        },
      ],
    },
  ],
});

svelte.run('one-class-per-file Svelte', oneClassPerFile, {
  valid: [
    '<script lang="ts">class Loader { load(): void {} }</script><p>Ready</p>',
  ],
  invalid: [
    {
      code: '<script lang="ts">class Loader {} class Saver {}</script>',
      errors: [
        {
          messageId: 'count',
        },
      ],
    },
  ],
});
