import { statisticsBranch } from './constants.ts';
import type { GitCommand } from './publish-stats.types.ts';

export function statisticsBranchLease(
  runGit: GitCommand,
  credentials: string[],
  remote: string,
): string {
  const branchRef = `refs/heads/${statisticsBranch}`;

  const currentBranch =
    runGit([
      ...credentials,
      'ls-remote',
      remote,
      branchRef,
    ])
      .split(/\s+/)[0] ?? '';

  return `--force-with-lease=${branchRef}:${currentBranch}`;
}
