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

type PublishFixture = {
  calls: string[];
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

  const calls: string[] = [];

  const responses: Record<string, string> = {
    'rev-parse': source,
    diff: statisticsPath,
    'ls-remote': `${source}\trefs/heads/main`,
  };

  if (!changed) {
    responses['diff'] = '';
  }

  if (advanced) {
    responses['ls-remote'] = `${committed}\trefs/heads/main`;
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

    assert.ok(command);
    calls.push(command);

    if (command === 'commit') {
      responses['rev-parse'] = committed;
    }

    if (command === 'push' && pushFails) {
      throw new Error('push rejected');
    }

    return responses[command] ?? '';
  }

  function validate(): Promise<void> {
    calls.push('validate');

    if (invalid) {
      throw new Error('invalid statistics');
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

  for (const operation of [
    'validate',
    'commit',
    'push',
  ]) {
    assert.equal(calls.includes(operation), false, operation);
  }
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
      assert.equal(calls.includes('commit'), false);
      assert.equal(calls.includes('push'), false);
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
        ...args,
      ],
      {
        cwd: checkout,
        encoding: 'utf8',
        env: {
          ...process.env,
          GIT_ALLOW_PROTOCOL: 'file',
        },
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
    localGit([
      'config',
      `url.${remote}.insteadOf`,
      'https://github.com/guesant/lobby.git',
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
