import { addSnapshotPackages } from './add-snapshot-packages.ts';
import type { SnapshotManifestInput } from './dependency-snapshot.types.ts';
import { Manifest } from '@github/dependency-submission-toolkit';

export function createSnapshotManifest(input: SnapshotManifestInput): Manifest {
  const manifest = new Manifest(input.target.lockfile, input.target.lockfile);

  addSnapshotPackages(input, manifest);

  return manifest;
}
