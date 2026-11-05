import noNestedCallArguments from '../eslint-rules/no-nested-call-arguments.ts';
import {
  oneClassPerFile,
  oneFunctionPerFile,
} from '../eslint-rules/one-function-per-file.ts';
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

const count = [
  {
    messageId: 'count',
  },
];

const form = [
  {
    messageId: 'form',
  },
];

const nested = [
  {
    messageId: 'nested',
  },
];

typescript.run('one-function-per-file', oneFunctionPerFile, {
  valid: [
    'function load(): void {}',
    'const load = (): void => {};',
    'class Loader { load(): void {} save(): void {} }',
  ],
  invalid: [
    {
      code: 'function load(): void {} function save(): void {}',
      errors: count,
    },
    {
      code: 'function load(): void { function save(): void {} }',
      errors: [
        ...count,
        ...form,
      ],
    },
    {
      code: 'const load = values.map((value) => value);',
      errors: form,
    },
  ],
});

typescript.run('one-class-per-file', oneClassPerFile, {
  valid: [
    'class Loader { load(): void {} save(): void {} }',
  ],
  invalid: [
    {
      code: 'class Loader {} class Saver {}',
      errors: count,
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
      errors: form,
    },
  ],
});

svelte.run('one-function-per-file Svelte', oneFunctionPerFile, {
  valid: [
    '<script lang="ts">function load(): void {}</script><p>Ready</p>',
  ],
  invalid: [
    {
      code: '<button onclick={() => {}}>Run</button>',
      errors: form,
    },
  ],
});

svelte.run('one-class-per-file Svelte', oneClassPerFile, {
  valid: [],
  invalid: [
    {
      code: '<script lang="ts">class Loader {} class Saver {}</script>',
      errors: count,
    },
  ],
});

typescript.run(
  'no-nested-call-arguments',
  noNestedCallArguments.rules['no-nested-call-arguments'],
  {
    valid: [
      'const inner = c(); const middle = b(inner); const result = a(middle);',
      'const result = obj.get().map(transform);',
      'const result = items.map((item) => parse(item));',
    ],
    invalid: [
      {
        code: 'const result = a(b(c()));',
        errors: [
          ...nested,
          ...nested,
        ],
      },
      {
        code: 'const result = a({ values: [b() + c()] });',
        errors: nested,
      },
      {
        code: 'const result = items.map((item) => parse(format(item)));',
        errors: nested,
      },
    ],
  },
);

svelte.run(
  'no-nested-call-arguments Svelte',
  noNestedCallArguments.rules['no-nested-call-arguments'],
  {
    valid: [
      '<p>{items.map((item) => format(item))}</p>',
    ],
    invalid: [
      {
        code: '<p>{format(normalize(value))}</p>',
        errors: nested,
      },
      {
        code: '<button onclick={() => parse(format(value))}>Run</button>',
        errors: nested,
      },
    ],
  },
);

typescript.run('types-only', typesOnly, {
  valid: [
    {
      code: "import type { Base } from './base.types.ts'; export interface Item extends Base {} export type Key = string; export { type Record } from './record.types.ts'; export type * from './shared.types.ts';",
      filename: 'record.types.ts',
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
      code: 'type Record = string; interface Item { id: string }',
      filename: 'record.model.ts',
      errors: [
        {
          messageId: 'declaration',
        },
        {
          messageId: 'declaration',
        },
      ],
    },
    {
      code: "export type { Record } from './record.types.ts'; export type * from './shared.types.ts';",
      filename: 'record.model.ts',
      errors: [
        {
          messageId: 'export',
        },
        {
          messageId: 'export',
        },
      ],
    },
    {
      code: "import './register-runtime.ts'; export const value = true; export * from './runtime.ts';",
      filename: 'record.types.ts',
      errors: [
        {
          messageId: 'runtime',
        },
        {
          messageId: 'runtime',
        },
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
