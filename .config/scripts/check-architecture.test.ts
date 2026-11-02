import { moduleCycles } from './module-boundaries.ts';
import { moduleDependencies } from './module-dependencies.ts';
import { dependencyViolations } from './module-policy.ts';
import assert from 'node:assert/strict';
import test from 'node:test';

void test('architecture distinguishes type contracts from forbidden visual integrations', (): void => {
  const dependencies = moduleDependencies(
    '<script lang="ts">import type { Value } from "./content.model.ts"; import Component from "./Card.svelte"; import { read } from "./data.server.ts";type Loaded = import("./lazy.model.ts").Value;</script><p>{label}</p>',
    true,
  );

  assert.deepEqual(dependencies, [
    {
      specifier: './content.model.ts',
      typeOnly: true,
    },
    {
      specifier: './Card.svelte',
      typeOnly: false,
    },
    {
      specifier: './data.server.ts',
      typeOnly: false,
    },
    {
      specifier: './lazy.model.ts',
      typeOnly: true,
    },
  ]);
  assert.equal(dependencyViolations('View.svelte', dependencies).length, 1);
  assert.equal(
    dependencyViolations('content.model.ts', dependencies).length,
    1,
  );
  assert.equal(
    dependencyViolations('search.controller.ts', dependencies).length,
    1,
  );
  assert.equal(
    dependencyViolations('search.viewmodel.svelte.ts', dependencies).length,
    1,
  );
  assert.deepEqual(
    moduleCycles(
      new Map([
        [
          'a',
          [
            'b',
          ],
        ],
        [
          'b',
          [
            'a',
          ],
        ],
      ]),
    ),
    [
      [
        'a',
        'b',
        'a',
      ],
    ],
  );
});
