import type { SnapshotTarget } from './dependency-snapshot.types.ts';
import { readdirSync } from 'node:fs';

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

for (const entry of readdirSync('.config/tooling', {
  withFileTypes: true,
})) {
  if (entry.isDirectory()) {
    const directory = `.config/tooling/${entry.name}`;

    dependencySnapshotTargets.push({
      directory,
      id: `tool-${entry.name}`,
      lockfile: `${directory}/pnpm-lock.yaml`,
    });
  }
}
