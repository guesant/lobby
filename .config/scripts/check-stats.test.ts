import type { LinkRecord } from '../../website/src/lib/features/content/content.types.ts';
import { validateStatistics } from '../../website/src/lib/features/content/statistics.validation.ts';
import { required } from './asset-data.ts';
import { readConfiguration } from './configuration.ts';
import { updateStats } from './update-stats.ts';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'vitest';
import { parse, stringify } from 'yaml';

const source = readConfiguration();

const entries = source.sections.flatMap((section): LinkRecord[] => {
  return section.links;
});

const github = required(
  entries.find((entry): boolean => {
    return entry.stats?.provider === 'github';
  }),
);

const leetcode = required(
  entries.find((entry): boolean => {
    return entry.stats?.provider === 'leetcode';
  }),
);

function username(entry: LinkRecord): string {
  return required(
    new URL(required(entry.url)).pathname.split('/')
      .filter(Boolean)
      .at(-1),
  );
}

function repository(id: number): unknown {
  return {
    id,
    private: false,
    owner: {
      login: username(github),
    },
    stargazers_count: 2,
    forks_count: 1,
  };
}

function leetData(): unknown {
  return {
    data: {
      matchedUser: {
        username: username(leetcode),
        profile: {
          ranking: 7,
        },
        submitStatsGlobal: {
          acSubmissionNum: [
            {
              difficulty: 'All',
              count: 6,
            },
            {
              difficulty: 'Easy',
              count: 3,
            },
            {
              difficulty: 'Medium',
              count: 2,
            },
            {
              difficulty: 'Hard',
              count: 1,
            },
          ],
        },
      },
      allQuestionsCount: [
        'All',
        'Easy',
        'Medium',
        'Hard',
      ].map(
        (
          difficulty,
        ): {
          difficulty: string;
          count: number;
        } => {
          return {
            difficulty,
            count: 100,
          };
        },
      ),
    },
  };
}

function fetcher(url: string): Promise<Response> {
  if (url.startsWith('https://leetcode.com/')) {
    return Promise.resolve(Response.json(leetData()));
  }

  if (url.includes('/repos?')) {
    return Promise.resolve(
      Response.json([
        repository(1),
      ]),
    );
  }

  return Promise.resolve(
    Response.json({
      login: username(github),
      followers: 4,
      public_repos: 1,
    }),
  );
}

test('atomic cache updates and failure retention', async (): Promise<void> => {
  const directory = await mkdtemp(join(tmpdir(), 'links-statistics-'));

  try {
    const outputPath = join(directory, 'statistics.yaml');

    const configurationPath = join(directory, 'links.yaml');

    await writeFile(configurationPath, stringify(source));

    const options = {
      outputPath,
      configurationPath,
      fetcher,
      now: (): Date => {
        return new Date('2026-01-01T00:00:00Z');
      },
    };

    const results = await updateStats(options);

    assert(
      results.every((result): boolean => {
        return result.status === 'updated';
      }),
    );

    const valid = await readFile(outputPath, 'utf8');

    const cached = validateStatistics(parse(valid));

    assert.equal(cached[github.id]?.profile_url, github.url);

    for (const failure of [
      (): Promise<Response> => {
        return Promise.resolve(
          Response.json(
            {},
            {
              status: 429,
            },
          ),
        );
      },
      (): Promise<never> => {
        return Promise.reject(new Error('fixture-timeout'));
      },
      (): Promise<Response> => {
        return Promise.resolve(new Response('invalid JSON'));
      },
    ]) {
      const result = await updateStats({
        ...options,
        fetcher: failure,
      });

      assert(
        result.every((item): boolean => {
          return item.status === 'cached';
        }),
      );
      assert.equal(await readFile(outputPath, 'utf8'), valid);
    }

    await updateStats({
      ...options,
      fetcher: async (url): Promise<Response> => {
        if (url.includes('leetcode.com')) {
          return Response.json(
            {},
            {
              status: 503,
            },
          );
        }

        return fetcher(url);
      },
      now: (): Date => {
        return new Date('2026-01-02T00:00:00Z');
      },
    });

    const partial = validateStatistics(
      parse(await readFile(outputPath, 'utf8')),
    );

    assert.deepEqual(partial[leetcode.id], cached[leetcode.id]);
    assert.notEqual(
      partial[github.id]?.updated_at,
      cached[github.id]?.updated_at,
    );

    const changed = structuredClone(source);

    const changedEntry = changed.sections
      .flatMap((section): LinkRecord[] => {
        return section.links;
      })
      .find((entry): boolean => {
        return entry.id === github.id;
      });

    assert.ok(changedEntry);
    changedEntry.url = 'https://github.com/fixture-account';
    await writeFile(configurationPath, stringify(changed));

    const changedResults = await updateStats({
      ...options,
      fetcher: (): Promise<Response> => {
        return Promise.resolve(
          Response.json(
            {},
            {
              status: 503,
            },
          ),
        );
      },
    });

    assert.ok(
      changedResults.some((item): boolean => {
        return item.id === github.id && item.status === 'unavailable';
      }),
    );
  } finally {
    await rm(directory, {
      recursive: true,
      force: true,
    });
  }
});
test('first failed collection does not fabricate a cache', async (): Promise<void> => {
  const directory = await mkdtemp(join(tmpdir(), 'links-statistics-'));

  try {
    const outputPath = join(directory, 'missing.yaml');

    const results = await updateStats({
      outputPath,
      fetcher: (): Promise<Response> => {
        return Promise.resolve(
          Response.json(
            {},
            {
              status: 503,
            },
          ),
        );
      },
    });

    assert(
      results.every((item): boolean => {
        return item.status === 'unavailable';
      }),
    );
    await assert.rejects(readFile(outputPath), {
      code: 'ENOENT',
    });
  } finally {
    await rm(directory, {
      recursive: true,
      force: true,
    });
  }
});
