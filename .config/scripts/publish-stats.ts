import { parse } from 'yaml';
import { spawnSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { validateStatistics } from '../../website/src/lib/content-validation.ts';
import {
  validateRepository,
  validateSha,
  writeCiOutputs,
} from './ci-policy.ts';

const statisticsPath = 'website/src/data/statistics.yaml';

function git(args: string[]): string {
  const result = spawnSync(
    'git',
    [
      '-c',
      'safe.directory=/workspace',
      ...args,
    ],
    {
      encoding: 'utf8',
    },
  );

  if (result.error || result.status !== 0) {
    throw new Error('Statistics git command failed');
  }

  return result.stdout.trim();
}

async function validateFile(): Promise<void> {
  validateStatistics(parse(await readFile(statisticsPath, 'utf8')));
}

export async function publishStatistics({
  token,
  repository,
  ref,
  runGit = git,
  validate = validateFile,
}: {
  token?: string | undefined;
  repository?: unknown;
  ref?: string | undefined;
  runGit?: typeof git;
  validate?: () => Promise<void>;
}): Promise<{
  changed: boolean;
  sha: string;
}> {
  validateRepository(repository);

  if (!token || ref !== 'refs/heads/main') {
    throw new Error(
      'Statistics publication requires main and workflow credentials',
    );
  }

  const source = validateSha(
    runGit([
      'rev-parse',
      'HEAD',
    ]),
  );

  if (
    !runGit([
      'diff',
      'HEAD',
      '--name-only',
      '--',
      statisticsPath,
    ])
  ) {
    return {
      changed: false,
      sha: source,
    };
  }

  await validate();

  const credentials = [
    '-c',
    'credential.helper=',
    '-c',
    `http.https://github.com/.extraheader=AUTHORIZATION: basic ${Buffer.from(
      `x-access-token:${token}`,
    )
      .toString('base64')}`,
  ];

  const remote = `https://github.com/${repository}.git`;

  const currentMain = runGit([
    ...credentials,
    'ls-remote',
    remote,
    'refs/heads/main',
  ])
    .split(/\s+/)[0];

  if (validateSha(currentMain) !== source) {
    throw new Error(
      'Main advanced during statistics collection; publication stopped',
    );
  }

  runGit([
    '-c',
    'user.name=github-actions[bot]',
    '-c',
    'user.email=41898282+github-actions[bot]@users.noreply.github.com',
    'commit',
    '--only',
    '-m',
    'chore(stats): refresh public statistics',
    '--',
    statisticsPath,
  ]);
  runGit([
    ...credentials,
    'push',
    remote,
    'HEAD:refs/heads/main',
  ]);

  return {
    changed: true,
    sha: validateSha(
      runGit([
        'rev-parse',
        'HEAD',
      ]),
    ),
  };
}

async function main(): Promise<void> {
  const result = await publishStatistics({
    token: process.env.GITHUB_STATS_TOKEN,
    repository: process.env.GITHUB_REPOSITORY,
    ref: process.env.GITHUB_REF,
  });

  let summary =
    'Statistics unchanged; no commit, build or deployment requested.';

  if (result.changed) {
    summary = `Statistics committed at ${result.sha}; validation and build will use this SHA.`;
  }

  await writeCiOutputs(result, summary);
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  await main();
}
