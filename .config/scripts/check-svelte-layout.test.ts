import { blockDirectiveNewline } from '../eslint-rules/block-directive-newline.ts';
import typescriptParser from '@typescript-eslint/parser';
import { Linter } from 'eslint';
import assert from 'node:assert/strict';
import { compile } from 'svelte/compiler';
import svelteParser from 'svelte-eslint-parser';
import { test } from 'vitest';

const configuration: Linter.Config = {
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
        'block-directive-newline': blockDirectiveNewline,
      },
    },
  },
  rules: {
    'lobby/block-directive-newline': 'error',
  },
};

function format(source: string): Linter.FixReport {
  return new Linter()
    .verifyAndFix(
      source,
      [
        configuration,
      ],
      {
        filename: 'Fixture.svelte',
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

test('Svelte directives are standalone, idempotent and preserve rendering', (): void => {
  const source =
    '<div> {#if ready} <div>yes</div> {:else} <div>no</div> {/if} {#each items as item (item.id)} <div>{item.name}</div> {/each} {#await result} <div>wait</div> {:then value} <div>{value}</div> {:catch error} <div>{error.message}</div> {/await} {#key key} <div>key</div> {/key} {#snippet content()} <div>snippet</div> {/snippet} {@render content()} </div>';

  const formatted = format(source);

  assert.equal(formatted.messages.length, 0);
  assert.equal(format(formatted.output).output, formatted.output);
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
    const formatted = format(source);

    assert.equal(formatted.fixed, false);
    assert.equal(formatted.output, source);
    assert.ok(formatted.messages.length > 0);
    assert.equal(renderedProgram(formatted.output), renderedProgram(source));
  }

  assert.equal(format('<p>{value}</p>').messages.length, 0);
});
