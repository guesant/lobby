import { assertSnapshotRepository } from './assert-snapshot-repository.ts';
import type {
  SnapshotContext,
  SnapshotEnvironment,
} from './dependency-snapshot.types.ts';

export function validateSnapshotEnvironment(
  environment: SnapshotEnvironment,
): SnapshotContext {
  const repository = environment.repository;

  assertSnapshotRepository(repository);

  const sha = environment.sha;

  const runId = environment.runId;

  const ref = environment.ref;

  if (
    sha === undefined ||
    !/^[a-f0-9]{40}$/i.test(sha) ||
    !Number.isSafeInteger(runId) ||
    ref !== 'refs/heads/main'
  ) {
    throw new Error(
      'Dependency snapshots require a trusted main build context',
    );
  }

  const owner = repository[0];

  const name = repository[1];

  return {
    eventName: 'push',
    job: 'dependency-submission',
    payload: {},
    ref,
    repo: {
      owner,
      repo: name,
    },
    runId,
    sha,
  };
}
