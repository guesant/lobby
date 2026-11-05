import { createSnapshotContext } from './create-snapshot-context.ts';
import { dependencySnapshotTargets } from './dependency-snapshot-targets.ts';
import { dependencySBOMs } from './security-inputs.ts';
import { submitSnapshotTarget } from './submit-snapshot-target.ts';

export async function submitDependencySBOMs(): Promise<void> {
  const context = createSnapshotContext();

  const sboms = await dependencySBOMs();

  for (const [
    index,
    target,
  ] of dependencySnapshotTargets.entries()) {
    const sbomPath = sboms[index];

    await submitSnapshotTarget(sbomPath, target, context);
  }
}

if (import.meta.main) {
  await submitDependencySBOMs();
}
