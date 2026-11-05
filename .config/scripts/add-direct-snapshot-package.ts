import type { PackageManifestDependencies } from './dependency-snapshot.types.ts';
import type { Package } from '@github/dependency-submission-toolkit';
import type { DependencyScope } from '@github/dependency-submission-toolkit';
import type { Manifest } from '@github/dependency-submission-toolkit';

export function addDirectSnapshotPackage(
  dependencyPackage: Package,
  manifest: Manifest,
  dependencies: PackageManifestDependencies,
): void {
  const namespace = dependencyPackage.namespace();

  let packageName = dependencyPackage.name();

  if (namespace !== null) {
    packageName = `${namespace}/${packageName}`;
  }

  let scope: DependencyScope = 'runtime';

  if (Object.hasOwn(dependencies.development, packageName)) {
    scope = 'development';
  } else if (
    !Object.hasOwn(dependencies.runtime, packageName) &&
    !Object.hasOwn(dependencies.optional, packageName)
  ) {
    throw new Error(
      `Direct CycloneDX dependency is missing from package.json: ${packageName}`,
    );
  }

  manifest.addDirectDependency(dependencyPackage, scope);
}
