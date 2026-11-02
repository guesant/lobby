import { record } from '../../../website/src/lib/features/content/validation.model.ts';
import type { GithubFetcher } from './ci-policy.types.ts';
import { validateRepository } from './validate-repository.ts';
import { validateSha } from './validate-sha.ts';

export async function deploymentStatus(input: {
  sha?: unknown;
  repository?: unknown;
  token?: string;
  fetcher?: GithubFetcher;
}): Promise<{
  current: boolean;
  source_sha: string;
  main_sha: string;
}> {
  const {
    sha,
    repository,
    token,
    fetcher = fetch
  } = input;

  const source = validateSha(sha);

  const project = validateRepository(repository);

  if (!token) {
    throw new Error('Missing deployment verification credentials');
  }

  const timeoutSignal = AbortSignal.timeout(20000);

  const response = await fetcher(
    `https://api.github.com/repos/${project}/git/ref/heads/main`,
    {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'User-Agent': 'guesant-lobby-ci',
        'X-GitHub-Api-Version': '2026-03-10',
      },
      redirect: 'error',
      signal: timeoutSignal,
    },
  );

  if (!response.ok) {
    throw new Error(
      `Cannot verify current main: HTTP ${String(response.status)}`,
    );
  }

  const responseBody: unknown = await response.json();

  const payload = record(responseBody, 'GitHub reference');

  const referenceObject = record(payload['object'], 'GitHub reference object');

  const current = validateSha(referenceObject['sha']);

  return {
    current: current === source,
    source_sha: source,
    main_sha: current,
  };
}
