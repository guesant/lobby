import { validateStatistics } from '../../website/src/lib/features/content/statistics.validation.ts';
import { publishStatistics } from './publish-stats.ts';
import { statisticsGitError } from './publish-stats/statistics-git-error.ts';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'vitest';
import { parse, stringify } from 'yaml';

const source = '1'.repeat(40);

const committed = '2'.repeat(40);

const statisticsPath = 'website/src/data/statistics.yaml';

test('git diagnostics retain the operation and failure while redacting raw and Basic credentials', (): void => {
  const token = 'schedule-fixture-token';

  const encoded = Buffer.from(`x-access-token:${token}`)
    .toString('base64');

  const args = [
    '-c',
    `http.https://github.com/.extraheader=AUTHORIZATION: basic ${encoded}`,
    'push',
    'https://github.com/guesant/lobby.git',
    'HEAD:refs/heads/main',
  ];

  const error = statisticsGitError(args, {
    status: 128,
    signal: null,
    stderr: `remote: Authentication failed: ${token}; Authorization: basic ${encoded}`,
  });

  assert.match(error.message, /Statistics git push failed \(128\)/);
  assert.match(error.message, /remote: Authentication failed/);
  assert.match(error.message, /\[REDACTED\]/);
  assert.equal(error.message.includes(token), false);
  assert.equal(error.message.includes(encoded), false);
  assert.equal(error.message.includes(args[3] ?? ''), false);
});

test('git diagnostics identify termination signals and process launch failures', (): void => {
  const terminated = statisticsGitError(
    [
      'ls-remote',
    ],
    {
      status: null,
      signal: 'SIGTERM',
      stderr: '',
    },
  );

  const unavailable = statisticsGitError(
    [
      'diff',
    ],
    {
      status: null,
      signal: null,
      stderr: '',
      error: new Error('spawn git ENOENT'),
    },
  );

  assert.match(terminated.message, /git ls-remote failed \(SIGTERM\)/);
  assert.match(
    unavailable.message,
    /git diff failed \(unavailable\): spawn git ENOENT/,
  );
});

type GitCall = {
  command: string | undefined;
  args?: string[];
};

type PublishFixture = {
  calls: GitCall[];
  options: Parameters<typeof publishStatistics>[0];
};

function fixture(
  input: {
    changed?: boolean;
    advanced?: boolean;
    pushFails?: boolean;
    invalid?: boolean;
  } = {},
): PublishFixture {
  const {
    changed = true,
    advanced = false,
    pushFails = false,
    invalid = false,
  } = input;

  const calls: {
    command: string | undefined;
    args?: string[];
  }[] = [];

  let sha = source;

  function remoteReference(): string {
    if (advanced) {
      return `${committed}\trefs/heads/main`;
    }

    return `${source}\trefs/heads/main`;
  }

  function runGit(args: string[]): string {
    const command = args.find((entry): boolean => {
      return [
        'rev-parse',
        'diff',
        'ls-remote',
        'commit',
        'push',
      ].includes(entry);
    });

    calls.push({
      command,
      args,
    });

    if (command === 'rev-parse') {
      return sha;
    }

    if (command === 'diff' && changed) {
      return statisticsPath;
    }

    if (command === 'ls-remote') {
      return remoteReference();
    }

    if (command === 'commit') {
      sha = committed;
    }

    if (command === 'push' && pushFails) {
      throw new Error('push rejected');
    }

    return '';
  }

  function validate(): Promise<void> {
    calls.push({
      command: 'validate',
    });

    if (invalid) {
      return Promise.reject(new Error('invalid statistics'));
    }

    return Promise.resolve();
  }

  return {
    calls,
    options: {
      token: 'workflow-token',
      repository: 'guesant/lobby',
      ref: 'refs/heads/main',
      runGit,
      validate,
    },
  };
}

test('unchanged statistics return their source SHA without validation, commit or push', async (): Promise<void> => {
  const {
    calls,
    options
  } = fixture({
    changed: false,
  });

  assert.deepEqual(await publishStatistics(options), {
    changed: false,
    sha: source,
  });
  assert.deepEqual(
    calls.map((entry): string | undefined => {
      return entry.command;
    }),
    [
      'rev-parse',
      'diff',
    ],
  );
});

for (const scenario of [
  {
    name: 'invalid data',
    options: {
      invalid: true,
    },
    message: /invalid statistics/,
  },
  {
    name: 'main advancing during collection',
    options: {
      advanced: true,
    },
    message: /Main advanced/,
  },
  {
    name: 'a rejected push',
    options: {
      pushFails: true,
    },
    message: /push rejected/,
  },
]) {
  test(`statistics publication rejects ${scenario.name}`, async (): Promise<void> => {
    const {
      calls,
      options
    } = fixture(scenario.options);

    await assert.rejects(publishStatistics(options), scenario.message);

    if (!scenario.options.pushFails) {
      assert.equal(
        calls.some((entry): boolean => {
          return entry.command === 'commit' || entry.command === 'push';
        }),
        false,
      );
    }
  });
}

test('statistics-only commit preserves unrelated staged changes and pushes only to a local fixture remote', async (): Promise<void> => {
  const directory = await mkdtemp(join(tmpdir(), 'lobby-statistics-publish-'));

  const remote = join(directory, 'remote.git');

  const checkout = join(directory, 'checkout');

  function localGit(args: string[]): string {
    const result = spawnSync(
      'git',
      [
        '-c',
        'user.name=fixture',
        '-c',
        'user.email=fixture@example.test',
        ...args.map((argument): string => {
          if (argument === 'https://github.com/guesant/lobby.git') {
            return remote;
          }

          return argument;
        }),
      ],
      {
        cwd: checkout,
        encoding: 'utf8',
      },
    );

    assert.equal(result.status, 0, result.stderr);

    return result.stdout.trim();
  }

  try {
    await mkdir(checkout);
    localGit([
      'init',
      '--bare',
      remote,
    ]);
    localGit([
      'init',
      '--initial-branch=main',
    ]);
    await mkdir(join(checkout, 'website/src/data'), {
      recursive: true,
    });

    const data = {
      fixture: {
        username: 'fixture',
        profile_url: 'https://github.com/fixture',
        provider: 'github',
        updated_at: '2026-01-01T00:00:00Z',
        metrics: {
          followers: 1,
        },
      },
    };

    await writeFile(join(checkout, statisticsPath), stringify(data));
    await writeFile(join(checkout, 'unrelated.txt'), 'initial');
    localGit([
      'add',
      '.',
    ]);
    localGit([
      'commit',
      '-m',
      'initial',
    ]);
    localGit([
      'push',
      remote,
      'HEAD:refs/heads/main',
    ]);

    data.fixture.metrics.followers = 2;
    await writeFile(join(checkout, statisticsPath), stringify(data));
    await writeFile(join(checkout, 'unrelated.txt'), 'staged change');
    localGit([
      'add',
      'unrelated.txt',
    ]);

    const result = await publishStatistics({
      token: 'workflow-token',
      repository: 'guesant/lobby',
      ref: 'refs/heads/main',
      runGit: localGit,
      validate: async (): Promise<void> => {
        validateStatistics(
          parse(await readFile(join(checkout, statisticsPath), 'utf8')),
        );
      },
    });

    assert.equal(result.changed, true);
    assert.equal(
      localGit([
        'show',
        '--format=',
        '--name-only',
        'HEAD',
      ]),
      statisticsPath,
    );
    assert.equal(
      localGit([
        'diff',
        '--cached',
        '--name-only',
      ]),
      'unrelated.txt',
    );
    assert.equal(
      localGit([
        'ls-remote',
        remote,
        'refs/heads/main',
      ])
        .split(/\s+/)[0],
      result.sha,
    );
  } finally {
    await rm(directory, {
      recursive: true,
      force: true,
    });
  }
});
