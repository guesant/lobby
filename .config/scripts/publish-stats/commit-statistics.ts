import { validateSha } from '../ci-policy.ts';
import { commitArguments, statisticsBranch } from './constants.ts';
import type { GitCommand } from './publish-stats.types.ts';
import { statisticsBranchLease } from './statistics-branch-lease.ts';

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

  const branchRef = `refs/heads/${statisticsBranch}`;

  const branchLease = statisticsBranchLease(runGit, credentials, remote);

  runGit(commitArguments);
  runGit([
    ...credentials,
    'push',
    branchLease,
    remote,
    `HEAD:${branchRef}`,
  ]);

  const commitSHA = runGit([
    'rev-parse',
    'HEAD',
  ]);

  return validateSha(commitSHA);
}
