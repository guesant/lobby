import { loadFeed } from './federation-cache.ts';
import { validateFeed } from './federation-validation.ts';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'vitest';

const source = {
  id: 'blog',
  origin: 'https://blog.guesant.net',
  url: 'https://blog.guesant.net/lobby.json',
};

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

function feed(
  items: Record<string, unknown>[] = [
    entry,
  ],
  origin = 'blog',
): {
  version: number;
  source: string;
  items: Record<string, unknown>[];
} {
  return {
    version: 1,
    source: origin,
    items,
  };
}

function offline(): Promise<never> {
  return Promise.reject(new Error('offline'));
}

function quiet(): void {
  return;
}

test('federation retains allowlisted public fields and accepts an empty feed', (): void => {
  const result = validateFeed(
    feed([
      {
        ...entry,
        secret: 'hidden',
        metadata: {
          ...entry.metadata,
          secret: 'hidden',
        },
      },
    ]),
    source,
  );

  assert.equal(JSON.stringify(result)
    .includes('hidden'), false);
  assert.equal(result.items[0]?.source, 'blog');
  assert.deepEqual(result.items[0].metadata, entry.metadata);
  assert.deepEqual(validateFeed(feed([]), source).items, []);
});

test('federation rejects unknown contracts and unsafe canonical URLs', (): void => {
  assert.throws((): void => {
    validateFeed(
      {
        ...feed(),
        version: 99,
      },
      source,
    );
  });
  assert.throws((): void => {
    validateFeed(
      feed([
        {
          ...entry,
          url: 'javascript:alert(1)',
        },
      ]),
      source,
    );
  });
});

test('project repository links retain their canonical record and reject unsafe or misplaced metadata', (): void => {
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

  const result = validateFeed(
    feed(
      [
        project,
      ],
      'resume',
    ),
    resume,
  ).items[0];

  assert.equal(result?.url, project.url);
  assert.equal(result.metadata['content_url'], project.metadata.content_url);

  for (const url of [
    'javascript:alert(1)',
    'http://github.com/guesant/ava-pro',
    'https://github.com.evil.test/guesant/ava-pro',
    'https://user:secret@github.com/guesant/ava-pro',
    'https://github.com:444/guesant/ava-pro',
  ]) {
    assert.throws((): void => {
      validateFeed(
        feed(
          [
            {
              ...project,
              metadata: {
                content_url: url,
              },
            },
          ],
          'resume',
        ),
        resume,
      );
    });
  }

  assert.throws((): void => {
    validateFeed(
      feed(
        [
          {
            ...project,
            type: 'case',
          },
        ],
        'resume',
      ),
      resume,
    );
  });
  assert.throws((): void => {
    validateFeed(
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

test('feed cache preserves valid data and remote timestamps across network failures and local inputs', async (): Promise<void> => {
  const cacheDirectory = await mkdtemp(join(tmpdir(), 'lobby-feed-'));

  const timestamp = '2026-10-01T03:00:00.000Z';

  const options = {
    cacheDirectory,
    warn: quiet,
  };

  const cachedPath = join(cacheDirectory, 'blog.json');

  const statusPath = join(cacheDirectory, 'blog.status.json');

  try {
    await assert.rejects(
      loadFeed(source, {
        ...options,
        fetcher: offline,
      }),
      /No valid feed/,
    );
    await loadFeed(source, {
      ...options,
      now: (): Date => {
        return new Date(timestamp);
      },
      fetcher: (): Promise<Response> => {
        return Promise.resolve(Response.json(feed()));
      },
    });

    const valid = await readFile(cachedPath, 'utf8');

    const cached = await loadFeed(source, {
      ...options,
      fetcher: offline,
      now: (): Date => {
        return new Date('2026-10-31T03:00:00.000Z');
      },
    });

    assert.equal(cached.items.length, 1);
    assert.deepEqual(JSON.parse(await readFile(statusPath, 'utf8')), {
      id: 'blog',
      mode: 'cache',
      lastSuccessfulFetchAt: timestamp,
    });
    await assert.rejects(
      loadFeed(source, {
        ...options,
        fetcher: (): Promise<Response> => {
          return Promise.resolve(
            Response.json({
              ...feed(),
              version: 99,
            }),
          );
        },
      }),
    );
    assert.equal(await readFile(cachedPath, 'utf8'), valid);
    await writeFile(cachedPath, JSON.stringify(feed([])));
    assert.deepEqual(
      (
        await loadFeed(source, {
          ...options,
          localFile: cachedPath,
        })
      ).items,
      [],
    );
    assert.deepEqual(JSON.parse(await readFile(statusPath, 'utf8')), {
      id: 'blog',
      mode: 'local',
      lastSuccessfulFetchAt: timestamp,
    });
    await writeFile(cachedPath, '{}');
    await assert.rejects(
      loadFeed(source, {
        ...options,
        localFile: cachedPath,
      }),
    );
    await assert.rejects(
      loadFeed(source, {
        ...options,
        fetcher: offline,
      }),
      /No valid feed or cache/,
    );
  } finally {
    await rm(cacheDirectory, {
      recursive: true,
      force: true,
    });
  }
});
