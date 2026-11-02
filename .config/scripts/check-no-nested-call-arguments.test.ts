import noNestedCallArguments from '../eslint-rules/no-nested-call-arguments.ts';
import typescriptParser from '@typescript-eslint/parser';
import { RuleTester } from 'eslint';
import svelteParser from 'svelte-eslint-parser';

const typescript = new RuleTester({
  languageOptions: {
    parser: typescriptParser,
    sourceType: 'module',
  },
});

typescript.run(
  'no-nested-call-arguments',
  noNestedCallArguments.rules['no-nested-call-arguments'],
  {
    valid: [
      'const inner = c(); const middle = b(inner); const result = a(middle);',
      'const result = obj.get().map(transform);',
      'const result = items.map((item) => parse(item));',
      'const result = `a(b(c))`;',
      'type Result = ReturnType<typeof load>;',
    ],
    invalid: [
      {
        code: 'const result = a(b());',
        errors: [
          {
            messageId: 'nested',
          },
        ],
      },
      {
        code: 'const result = a(b(c));',
        errors: [
          {
            messageId: 'nested',
          },
        ],
      },
      {
        code: 'const result = a(b(c()));',
        errors: [
          {
            messageId: 'nested',
          },
          {
            messageId: 'nested',
          },
        ],
      },
      {
        code: 'const result = a({ value: b() });',
        errors: [
          {
            messageId: 'nested',
          },
        ],
      },
      {
        code: 'const result = a(b() + c());',
        errors: [
          {
            messageId: 'nested',
          },
        ],
      },
      {
        code: 'const result = items.map((item) => parse(format(item)));',
        errors: [
          {
            messageId: 'nested',
          },
        ],
      },
    ],
  },
);

const svelte = new RuleTester({
  languageOptions: {
    parser: svelteParser,
    parserOptions: {
      parser: typescriptParser,
    },
    sourceType: 'module',
  },
});

svelte.run(
  'no-nested-call-arguments Svelte',
  noNestedCallArguments.rules['no-nested-call-arguments'],
  {
    valid: [
      '<p>{format(value)}</p>',
      '<p>{items.map((item) => format(item))}</p>',
    ],
    invalid: [
      {
        code: '<p>{format(normalize(value))}</p>',
        errors: [
          {
            messageId: 'nested',
          },
        ],
      },
      {
        code: '<button onclick={() => parse(format(value))}>Run</button>',
        errors: [
          {
            messageId: 'nested',
          },
        ],
      },
    ],
  },
);
