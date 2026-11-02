import { validateSha } from '../ci-policy.ts';
import { commitArguments } from './constants.ts';
import type { GitCommand } from './publish-stats.types.ts';

export function commitStatistics(
  runGit: GitCommand,
  authentication: {
    token: string;
    repository: string;
  },
  source: string,
): string {
  const token = Buffer.from(`x-access-token:${authentication.token}`);

  const encodedToken = token.toString('base64');

  const credentials = [
    '-c',
    'credential.helper=',
    '-c',
    `http.https://github.com/.extraheader=AUTHORIZATION: basic ${encodedToken}`,
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

  const commitSHA = runGit([
    'rev-parse',
    'HEAD',
  ]);

  return validateSha(commitSHA);
}
