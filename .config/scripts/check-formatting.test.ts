import { blockDirectiveNewline } from '../eslint-rules/block-directive-newline.ts';
import { multilineStructures } from '../eslint-rules/layout.ts';
import statementSpacing from '../eslint-rules/statement-spacing.ts';
import typescriptParser from '@typescript-eslint/parser';
import { Linter } from 'eslint';
import assert from 'node:assert/strict';
import { compile } from 'svelte/compiler';
import svelteParser from 'svelte-eslint-parser';
import { test } from 'vitest';

const typescript: Linter.Config = {
  files: [
    '**/*.ts',
  ],
  languageOptions: {
    parser: typescriptParser,
  },
  plugins: {
    lobby: {
      rules: {
        'multiline-structures': multilineStructures,
      },
    },
  },
  rules: {
    'lobby/multiline-structures': 'error',
  },
};

const svelte: Linter.Config = {
  files: [
    '**/*.svelte',
  ],
  languageOptions: {
    parser: svelteParser,
    parserOptions: {
      parser: typescriptParser,
    },
  },
  plugins: {
    lobby: {
      rules: {
        ...statementSpacing.rules,
        'block-directive-newline': blockDirectiveNewline,
        'multiline-structures': multilineStructures,
      },
    },
  },
  rules: {
    'lobby/svelte-top-level-spacing': 'error',
    'lobby/svelte-import-first': 'error',
    'lobby/block-directive-newline': 'error',
    'lobby/multiline-structures': 'error',
  },
};

function format(source: string, component = false): Linter.FixReport {
  if (component) {
    return new Linter()
      .verifyAndFix(
        source,
        [
          svelte,
        ],
        {
          filename: 'Fixture.svelte',
        },
      );
  }

  return new Linter()
    .verifyAndFix(
      source,
      [
        typescript,
      ],
      {
        filename: 'Fixture.ts',
      },
    );
}

function renderedProgram(source: string): string {
  return compile(source, {
    generate: 'server',
    dev: false,
    filename: 'Fixture.svelte',
  }).js.code;
}

test('multiline autofix preserves TypeScript tokens, tool directives and template whitespace', (): void => {
  const source =
    '// @ts-expect-error: formatting fixture\ntype Value = { count: number }; interface Values { first: number; second: number } const { value } = { value: 1 }; const [first] = [value]; type Pair = [string, number]; const text = `keep  \nspaces`;';

  const formatted = format(source);

  const before = typescriptParser.parse(source, {
    tokens: true,
    comment: true,
  });

  const after = typescriptParser.parse(formatted.output, {
    tokens: true,
    comment: true,
  });

  assert.equal(formatted.messages.length, 0);
  assert.equal(formatted.fixed, true);
  assert.equal(format(formatted.output).output, formatted.output);
  assert.ok(before.tokens.length);
  assert.deepEqual(
    after.tokens.map((token): string => {
      return token.value;
    }),
    before.tokens.map((token): string => {
      return token.value;
    }),
  );
  assert.deepEqual(
    after.comments.map((comment): string => {
      return comment.value;
    }),
    before.comments.map((comment): string => {
      return comment.value;
    }),
  );
  assert.match(formatted.output, /type Value = \{\n/);
  assert.match(formatted.output, /const \{\n/);
  assert.match(formatted.output, /type Pair = \[\n/);
});

test('Svelte import and declaration autofix preserves rendered output', (): void => {
  const source =
    '<script lang="ts">const value = { id: 1 }; import first from "first"; import second from "second";</script><p>{value.id}</p>';

  const formatted = format(source, true);

  assert.equal(formatted.messages.length, 0);
  assert.equal(format(formatted.output, true).output, formatted.output);
  assert.equal(renderedProgram(formatted.output), renderedProgram(source));
  assert.match(
    formatted.output,
    /import first.*\nimport second.*\n\nconst value/s,
  );
});

test('Svelte block autofix is idempotent and preserves rendering', (): void => {
  const source =
    '<div> {#if ready} <div>yes</div> {:else} <div>no</div> {/if} {#each items as item (item.id)} <div>{item.name}</div> {/each} {#await result} <div>wait</div> {:then value} <div>{value}</div> {:catch error} <div>{error.message}</div> {/await} {#key key} <div>key</div> {/key} {#snippet content()} <div>snippet</div> {/snippet} {@render content()} </div>';

  const formatted = format(source, true);

  assert.equal(formatted.messages.length, 0);
  assert.equal(format(formatted.output, true).output, formatted.output);
  assert.equal(renderedProgram(formatted.output), renderedProgram(source));
  assert.match(formatted.output, /\n\{#if ready\}\n/);
  assert.match(formatted.output, /\n\{:catch error\}\n/);
  assert.match(formatted.output, /\n\{\/snippet\}\n/);
});

test('sensitive inline, pre and textarea whitespace is never autofixed', (): void => {
  for (const source of [
    '<p>one {#if ready}<strong>two</strong>{:else}three{/if} four</p>',
    '<pre>  before{#if ready}\n  after{/if}</pre>',
    '{#if ready}<textarea>before {value}\n after</textarea>{/if}',
  ]) {
    const formatted = format(source, true);

    assert.equal(formatted.fixed, false);
    assert.equal(formatted.output, source);
    assert.ok(formatted.messages.length > 0);
    assert.equal(renderedProgram(formatted.output), renderedProgram(source));
  }

  assert.equal(format('<p>{value}</p>', true).messages.length, 0);
});
