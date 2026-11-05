import type { SnapshotTarget } from './dependency-snapshot.types.ts';

export const dependencySnapshotTargets: SnapshotTarget[] = [
  {
    directory: 'website',
    id: 'website',
    lockfile: 'website/pnpm-lock.yaml',
  },
  {
    directory: '.config',
    id: 'tooling',
    lockfile: '.config/pnpm-lock.yaml',
  },
  {
    directory: '.config/audit',
    id: 'audit',
    lockfile: '.config/audit/pnpm-lock.yaml',
  },
];
