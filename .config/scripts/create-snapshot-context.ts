import type {
  SnapshotContext,
  SnapshotEnvironment,
} from './dependency-snapshot.types.ts';
import { validateSnapshotEnvironment } from './validate-snapshot-environment.ts';

export function createSnapshotContext(): SnapshotContext {
  const repository = process.env['GITHUB_REPOSITORY'];

  const environment: SnapshotEnvironment = {
    ref: process.env['GITHUB_REF'],
    repository: repository?.split('/'),
    runId: Number(process.env['GITHUB_RUN_ID']),
    sha: process.env['LOBBY_SOURCE_SHA'],
  };

  return validateSnapshotEnvironment(environment);
}
