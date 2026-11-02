import { validateRepository, validateSha } from '../ci-policy.ts';
import { commitStatistics } from './commit-statistics.ts';
import { statisticsPath } from './constants.ts';
import { git } from './git.ts';
import type {
  PublicationOptions,
  PublicationResult,
} from './publish-stats.types.ts';
import { validateStatisticsFile } from './validate-statistics-file.ts';

export async function publishStatistics(
  input: PublicationOptions,
): Promise<PublicationResult> {
  const {
    token,
    repository,
    ref,
    runGit = git,
    validate = validateStatisticsFile,
  } = input;

  const repositoryName = validateRepository(repository);

  if (!token || ref !== 'refs/heads/main') {
    throw new Error(
      'Statistics publication requires main and workflow credentials',
    );
  }

  const currentSHA = runGit([
    'rev-parse',
    'HEAD',
  ]);

  const source = validateSha(currentSHA);

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
