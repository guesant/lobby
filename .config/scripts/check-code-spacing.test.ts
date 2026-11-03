import { canonicalFormat } from './quality.ts';
import typescriptParser from '@typescript-eslint/parser';
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { parseForESLint } from 'svelte-eslint-parser';
import ts from 'typescript';
import { test } from 'vitest';

function tokens(source: string, component: boolean): string[] {
  let script = source;

  if (component) {
    const parsed = parseForESLint(source, {
      parser: typescriptParser,
      sourceType: 'module',
    });

    script = parsed.ast.body
      .flatMap((block): string[] => {
        if (block.type !== 'SvelteScriptElement' || !block.endTag) {
          return [];
        }

        return [
          source.slice(block.startTag.range[1], block.endTag.range[0]),
        ];
      })
      .join('\n');
  }

  const scanner = ts.createScanner(
    ts.ScriptTarget.Latest,
    true,
    ts.LanguageVariant.Standard,
    script,
  );

  const result: string[] = [];

  let kind = scanner.scan();

  while (kind !== ts.SyntaxKind.EndOfFileToken) {
    if (kind === ts.SyntaxKind.StringLiteral) {
      result.push(JSON.stringify(scanner.getTokenValue()));
    } else {
      result.push(scanner.getTokenText());
    }

    kind = scanner.scan();
  }

  return result.filter((value, index): boolean => {
    if (value !== ',' && value !== ';') {
      return true;
    }

    return ![
      '}',
      ']',
      ')',
    ].includes(result[index + 1] ?? '');
  });
}

const fixtures = [
  {
    file: 'website/src/lib/features/navigation/routes.model.ts',
    source:
      "// @ts-expect-error: formatting fixture\nimport 'node:assert';\n\nimport 'node:path';\ntype Value = { count: number }; interface Values { first: number; second: number }\nconst { value } = { value: 1 }; const [first] = [value];\nexport const text = `keep  \nspaces`;\nexport async function run(): Promise<void> { object.method(); object?.method(); (await load()).method(); object.method().next(); object?.method()?.next(); if (first) { object.method(); } }",
  },
  {
    file: 'website/src/lib/app/SitePage.svelte',
    source:
      '<script lang="ts">import { onMount } from "svelte";const values = [{ key: 1 }];onMount((): void => { values.map((value): number => { return value.key; }).filter(Boolean); });</script><p>Ready</p>',
  },
];

for (const fixture of fixtures) {
  test(
    'formatter preserves tokens and reaches a fixed point in ' + fixture.file,
    async (): Promise<void> => {
      const path = resolve(fixture.file);

      const output = await canonicalFormat(fixture.source, path);

      assert.equal(await canonicalFormat(output, path), output);
      assert.deepEqual(
        tokens(output, fixture.file.endsWith('.svelte')),
        tokens(fixture.source, fixture.file.endsWith('.svelte')),
      );

      if (fixture.file.endsWith('.ts')) {
        assert.match(output, /object\.method\(\);/);
        assert.match(output, /\(await load\(\)\)\.method\(\);/);
        assert.match(output, /object\.method\(\)\n\s*\.next\(\)/);
        assert.match(output, /object\?\.method\(\)\n\s*\?\.next\(\)/);
        assert.match(output, /type Value = \{\n/);
        assert.match(output, /const \{\n/);
        assert.match(output, /const \[\n/);
        assert.match(output, /import 'node:assert';\nimport 'node:path';\n\n/);
        assert.ok(
          output.startsWith('// @ts-expect-error: formatting fixture\n'),
        );
        assert.ok(output.includes('`keep  \nspaces`'));
      }
    },
  );
}
