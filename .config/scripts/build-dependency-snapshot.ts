import { createDependencyPackages } from './create-dependency-packages.ts';
import { createSnapshotManifest } from './create-snapshot-manifest.ts';
import type {
  SnapshotContext,
  SnapshotManifestInput,
  SnapshotTarget,
} from './dependency-snapshot.types.ts';
import { readDependencySBOM } from './read-dependency-sbom.ts';
import { readPackageManifestDependencies } from './read-package-manifest-dependencies.ts';
import { Snapshot } from '@github/dependency-submission-toolkit';

export async function buildDependencySnapshot(
  sbomPath: string,
  target: SnapshotTarget,
  context: SnapshotContext,
): Promise<Snapshot> {
  const model = await readDependencySBOM(sbomPath);

  const manifestDependencies = await readPackageManifestDependencies(
    target.directory,
  );

  const packages = createDependencyPackages(model);

  const manifestInput: SnapshotManifestInput = {
    dependencies: manifestDependencies,
    model,
    packages,
    target,
  };

  const manifest = createSnapshotManifest(manifestInput);

  const detector = {
    name: 'lobby-pnpm-cyclonedx',
    url: 'https://github.com/guesant/lobby',
    version: '1',
  };

  const jobId = `${String(context.runId)}-${target.id}`;

  const correlator = `lobby/${target.lockfile}`;

  const job = {
    correlator,
    id: jobId,
  };

  const snapshot = new Snapshot(detector, undefined, job);

  snapshot.sha = context.sha;
  snapshot.ref = context.ref;

  snapshot.addManifest(manifest);

  return snapshot;
}
