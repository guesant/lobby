import { createSearchController } from '../../website/src/lib/features/search/search.controller.ts';
import {
  filterSearchItems,
  initialSearchState,
  isSearchItem,
  type SearchItem,
  searchItems,
} from '../../website/src/lib/features/search/search.model.ts';
import assert from 'node:assert/strict';
import test from 'node:test';

const entries: SearchItem[] = [
  {
    id: 'one',
    title: 'Formação',
    summary: 'A public summary',
    tags: [
      'backend',
    ],
    metadata: {
      area: 'Computação',
    },
    url: '/pt-br/career/',
    group: 'Career',
    source: 'resume',
    language: 'pt-br',
    type: 'education',
  },
  {
    id: 'two',
    title: 'Project',
    summary: 'A public project',
    tags: [
      'frontend',
    ],
    metadata: {},
    url: 'https://blog.guesant.net/project/',
    group: 'Writing',
    source: 'blog',
    language: 'en',
    type: 'post',
  },
];

void test('search state is isolated and cancelled requests cannot publish late results', async (): Promise<void> => {
  const first = initialSearchState();

  const second = initialSearchState();

  let finish: ((items: SearchItem[]) => void) | undefined;

  let signal: AbortSignal | undefined;

  const controller = createSearchController(first, {
    indexURL(): string {
      return '/search/test.json';
    },
    closeDialog(): void {
      return;
    },
    readIndex(_url, requestSignal): Promise<SearchItem[]> {
      signal = requestSignal;

      return new Promise((resolve): void => {
        finish = resolve;
      });
    },
  });

  const pending = controller.load();

  controller.destroy();
  assert.equal(signal?.aborted, true);
  assert.ok(finish);
  finish(entries);
  await pending;
  assert.equal(first.phase, 'loading');
  assert.equal(first.index.length, 0);
  assert.equal(second.phase, 'idle');
});

void test('search retains every match beyond the previous one hundred item limit', (): void => {
  const first = entries[0];

  assert.ok(first);

  const many = Array.from(
    {
      length: 150,
    },
    (_, index): SearchItem => {
      return {
        ...first,
        id: String(index),
      };
    },
  );

  assert.equal(searchItems(many, 'backend').length, 150);
  assert.equal(many.length, 150);
});

void test('source, language and type filters combine without mutating the index', (): void => {
  const matching = searchItems(entries, 'public');

  assert.equal(matching.length, 2);
  assert.equal(
    filterSearchItems(matching, {
      source: 'resume',
      language: 'pt-br',
      type: 'education',
    })[0]?.id,
    'one',
  );
  assert.equal(
    filterSearchItems(matching, {
      source: 'resume',
      language: 'en',
      type: '',
    }).length,
    0,
  );
  assert.equal(
    filterSearchItems(matching, {
      source: '',
      language: '',
      type: '',
    }).length,
    2,
  );
  assert.equal(entries.length, 2);
});

void test('search validates unknown data and rejects unsafe or incomplete destinations', (): void => {
  const first = entries[0];

  assert.ok(first);
  assert.equal(isSearchItem(first), true);

  for (const value of [
    null,
    [],
    {},
    {
      ...first,
      url: 'javascript:alert(1)',
    },
    {
      ...first,
      details_url: 'https://example.org',
    },
    {
      ...first,
      tags: [
        3,
      ],
    },
  ]) {
    assert.equal(isSearchItem(value), false);
  }
});
