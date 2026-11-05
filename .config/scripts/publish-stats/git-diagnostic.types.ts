import type { SpawnSyncReturns } from 'node:child_process';

export type GitDiagnosticResult = Pick<
  SpawnSyncReturns<string>,
  'stderr' | 'error' | 'status' | 'signal'
>;
