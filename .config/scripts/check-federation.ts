type TestFeed = {
  version: number;
  source: string;
  items: Record<string, unknown>[];
};

type Feed = ReturnType<typeof validateFeed>;

import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { loadFeed, validateFeed } from './federation.ts';
import { record } from '../../website/src/lib/validation-primitives.ts';

async function remoteFeed(value: TestFeed): Promise<{
  ok: true;
  text(): Promise<string>;
}> {
  return {
    ok: true,
    text: async (): Promise<string> => {
      return JSON.stringify(value);
    },
  };
}

const source = {
  id: 'blog',
  origin: 'https://blog.guesant.net',
  url: 'https://blog.guesant.net/lobby.json',
};

void test('cache reuse and local sources never renew a remote success timestamp', async (): Promise<void> => {
  const directory = await mkdtemp(join(tmpdir(), 'lobby-freshness-'));

  const timestamp = '2026-10-01T03:00:00.000Z';

  try {
    await loadFeed(source, {
      cacheDirectory: directory,
      now: (): Date => {
        return new Date(timestamp);
      },
      fetcher: async (): Promise<{
        ok: boolean;
        text(): Promise<string>;
      }> => {
        return {
          ok: true,
          text: async (): Promise<string> => {
            return JSON.stringify(feed());
          },
        };
      },
    });
    await loadFeed(source, {
      cacheDirectory: directory,
      warn: (): void => {},
      now: (): Date => {
        return new Date('2026-10-31T03:00:00.000Z');
      },
      fetcher: async (): Promise<never> => {
        throw new Error('offline');
      },
    });

    const cached: unknown = JSON.parse(
      await readFile(join(directory, 'blog.status.json'), 'utf8'),
    );

    assert.deepEqual(cached, {
      id: 'blog',
      mode: 'cache',
      lastSuccessfulFetchAt: timestamp,
    });
    await loadFeed(source, {
      cacheDirectory: directory,
      localFile: join(directory, 'blog.json'),
    });

    const local: unknown = JSON.parse(
      await readFile(join(directory, 'blog.status.json'), 'utf8'),
    );

    assert.deepEqual(local, {
      id: 'blog',
      mode: 'local',
      lastSuccessfulFetchAt: timestamp,
    });
    await writeFile(join(directory, 'blog.json'), '{"version":99}');
    await assert.rejects(
      loadFeed(source, {
        cacheDirectory: directory,
        warn: (): void => {},
        fetcher: async (): Promise<never> => {
          throw new Error('offline');
        },
      }),
      /No valid feed or cache/,
    );
  } finally {
    await rm(directory, {
      recursive: true,
      force: true,
    });
  }
});

const entry = {
  id: 'post-one',
  language: 'pt-br',
  type: 'post',
  title: 'A public post',
  summary: 'Public summary',
  url: 'https://blog.guesant.net/posts/one/',
  tags: [
    'testing',
  ],
  metadata: {
    date: '2026-01-01',
  },
};

const feed = (
  items: Record<string, unknown>[] = [
    entry,
  ],
): TestFeed => {
  return {
    version: 1,
    source: 'blog',
    items,
  };
};

void test('federation keeps only public allowlisted fields', (): void => {
  const result = validateFeed(
    feed([
      {
        ...entry,
        secret: 'hidden',
        metadata: {
          secret: 'hidden',
          date: '2026-01-01',
        },
      },
    ]),
    source,
  );

  assert(!JSON.stringify(result)
    .includes('hidden'));
  assert.equal(result.items[0]!.source, 'blog');
  assert.equal(result.items[0]!.metadata.date, '2026-01-01');
  assert.deepEqual(validateFeed(feed([]), source).items, []);
});
void test('resume projects retain only safe declared public platform URLs', (): void => {
  const resume = {
    id: 'resume',
    origin: 'https://curriculum.guesant.net',
  };

  const project = {
    ...entry,
    type: 'project',
    url: 'https://curriculum.guesant.net/en/#project-one',
    metadata: {
      content_url: 'https://github.com/guesant/ava-pro',
    },
  };

  const input = {
    version: 1,
    source: 'resume',
    items: [
      project,
    ],
  };

  const result = validateFeed(input, resume).items[0]!;

  assert.equal(result.url, project.url);
  assert.equal(result.metadata.content_url, project.metadata.content_url);

  for (const url of [
    'javascript:alert(1)',
    'http://github.com/guesant/ava-pro',
    'https://github.com.evil.test/guesant/ava-pro',
    'https://user:secret@github.com/guesant/ava-pro',
    'https://github.com:444/guesant/ava-pro',
  ] as const) {
    assert.throws((): Feed => {
      return validateFeed(
        {
          ...input,
          items: [
            {
              ...project,
              metadata: {
                content_url: url,
              },
            },
          ],
        },
        resume,
      );
    });
  }

  assert.throws((): Feed => {
    return validateFeed(
      {
        ...input,
        items: [
          {
            ...project,
            type: 'case',
          },
        ],
      },
      resume,
    );
  });
  assert.throws((): Feed => {
    return validateFeed(
      feed([
        {
          ...entry,
          metadata: project.metadata,
        },
      ]),
      source,
    );
  });
});

for (const [
  name,
  modify,
] of [
  [
    'unknown version',
    (value): void => {
      value.version = 2;
    },
  ],
  [
    'unsafe URL',
    (value): void => {
      value.items[0]!.url = 'javascript:alert(1)';
    },
  ],
  [
    'private',
    (value): void => {
      value.items[0]!.private = true;
    },
  ],
] satisfies Array<
  [
    string,
    (value: TestFeed) => void,
  ]
>) {
  void test(`federation rejects ${name}`, (): void => {
    const value = structuredClone(feed());

    modify(value);
    assert.throws((): Feed => {
      return validateFeed(value, source);
    });
  });
}

void test('federation uses valid cache only for network failures', async (): Promise<void> => {
  const directory = await mkdtemp(join(tmpdir(), 'lobby-feed-'));

  try {
    const messages = [];

    const options = {
      cacheDirectory: directory,
      warn: (message: string): number => {
        return messages.push(message);
      },
    };

    await loadFeed(source, {
      ...options,
      fetcher: (): ReturnType<typeof remoteFeed> => {
        return remoteFeed(feed());
      },
    });

    const result = await loadFeed(source, {
      ...options,
      fetcher: async (): Promise<never> => {
        throw new Error('Offline');
      },
    });

    assert.equal(result.items.length, 1);
    assert.equal(messages.length, 1);
    await assert.rejects(
      loadFeed(source, {
        ...options,
        fetcher: (): ReturnType<typeof remoteFeed> => {
          return remoteFeed({
            ...feed(),
            version: 9,
          });
        },
      }),
    );
    assert.equal(
      record(
        JSON.parse(
          await readFile(join(directory, 'blog.json'), 'utf8'),
        ) as unknown,
        'cached feed',
      ).version,
      1,
    );
  } finally {
    await rm(directory, {
      recursive: true,
      force: true,
    });
  }
});
void test('federation fails without usable cache and supports local generated inputs', async (): Promise<void> => {
  const directory = await mkdtemp(join(tmpdir(), 'lobby-feed-'));

  try {
    const fetcher = async (): Promise<never> => {
      throw new Error('Offline');
    };

    await assert.rejects(
      loadFeed(source, {
        cacheDirectory: directory,
        fetcher,
      }),
      /No valid feed/,
    );

    const localFile = join(directory, 'local.json');

    await writeFile(localFile, JSON.stringify(feed([])));
    assert.deepEqual(
      (
        await loadFeed(source, {
          cacheDirectory: directory,
          fetcher,
          localFile,
        })
      ).items,
      [],
    );
    await writeFile(localFile, '{}');
    await assert.rejects(
      loadFeed(source, {
        cacheDirectory: directory,
        localFile,
      }),
    );
  } finally {
    await rm(directory, {
      recursive: true,
      force: true,
    });
  }
});
