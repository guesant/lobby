import { buildDependencySnapshot } from './build-dependency-snapshot.ts';
import type {
  SnapshotContext,
  SnapshotTarget,
} from './dependency-snapshot.types.ts';
import { submitDependencySnapshot } from './submit-dependency-snapshot.ts';

export async function submitSnapshotTarget(
  sbomPath: string | undefined,
  target: SnapshotTarget,
  context: SnapshotContext,
): Promise<void> {
  if (sbomPath === undefined) {
    throw new Error(`Missing generated CycloneDX SBOM for ${target.lockfile}`);
  }

  const snapshot = await buildDependencySnapshot(sbomPath, target, context);

  await submitDependencySnapshot(
    snapshot,
    context.repo.owner,
    context.repo.repo,
  );
}
