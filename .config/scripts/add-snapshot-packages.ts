import { addDirectSnapshotPackage } from './add-direct-snapshot-package.ts';
import type { SnapshotManifestInput } from './dependency-snapshot.types.ts';
import type { Manifest } from '@github/dependency-submission-toolkit';

export function addSnapshotPackages(
  input: SnapshotManifestInput,
  manifest: Manifest,
): void {
  const directRefs = new Set(input.model.rootDependencies);

  for (const component of input.model.components) {
    const dependencyPackage = input.packages.get(component.bomRef);

    if (dependencyPackage === undefined) {
      throw new Error(
        `CycloneDX package reference is unresolved: ${component.bomRef}`,
      );
    }

    if (!directRefs.has(component.bomRef)) {
      manifest.addIndirectDependency(dependencyPackage);
      continue;
    }

    addDirectSnapshotPackage(dependencyPackage, manifest, input.dependencies);
  }
}
