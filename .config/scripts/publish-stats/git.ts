import { statisticsGitError } from './statistics-git-error.ts';
import { spawnSync } from 'node:child_process';

export function git(args: string[]): string {
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
    throw statisticsGitError(args, result);
  }

  return result.stdout.trim();
}
