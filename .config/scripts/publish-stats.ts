import { validateStatistics } from '../../website/src/lib/features/content/statistics.validation.ts';
import {
  validateRepository,
  validateSha,
  writeCiOutputs,
} from './ci-policy.ts';
import { spawnSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parse } from 'yaml';

const statisticsPath = 'website/src/data/statistics.yaml';

const commitArguments = [
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
];

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

  if (result.error ?? result.status !== 0) {
    throw new Error('Statistics git command failed');
  }

  return result.stdout.trim();
}

async function validateFile(): Promise<void> {
  validateStatistics(parse(await readFile(statisticsPath, 'utf8')));
}

type PublicationOptions = {
  token?: string | undefined;
  repository?: unknown;
  ref?: string | undefined;
  runGit?: typeof git;
  validate?: () => Promise<void>;
};

type PublicationResult = {
  changed: boolean;
  sha: string;
};

export async function publishStatistics(
  input: PublicationOptions,
): Promise<PublicationResult> {
  const {
    token,
    repository,
    ref,
    runGit = git,
    validate = validateFile,
  } = input;

  const repositoryName = validateRepository(repository);

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

  return {
    changed: true,
    sha: commitStatistics(
      runGit,
      {
        token,
        repository: repositoryName,
      },
      source,
    ),
  };
}

function commitStatistics(
  runGit: typeof git,
  authentication: {
    token: string;
    repository: string;
  },
  source: string,
): string {
  const credentials = [
    '-c',
    'credential.helper=',
    '-c',
    `http.https://github.com/.extraheader=AUTHORIZATION: basic ${Buffer.from(
      `x-access-token:${authentication.token}`,
    )
      .toString('base64')}`,
  ];

  const remote = `https://github.com/${authentication.repository}.git`;

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

  runGit(commitArguments);
  runGit([
    ...credentials,
    'push',
    remote,
    'HEAD:refs/heads/main',
  ]);

  return validateSha(
    runGit([
      'rev-parse',
      'HEAD',
    ]),
  );
}

async function main(): Promise<void> {
  const result = await publishStatistics({
    token: process.env['GITHUB_STATS_TOKEN'],
    repository: process.env['GITHUB_REPOSITORY'],
    ref: process.env['GITHUB_REF'],
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
