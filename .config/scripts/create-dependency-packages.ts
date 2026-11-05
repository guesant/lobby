import type { CycloneDXModel } from './dependency-snapshot.types.ts';
import type { Package } from '@github/dependency-submission-toolkit';
import { PackageCache } from '@github/dependency-submission-toolkit';

export function createDependencyPackages(
  model: CycloneDXModel,
): Map<string, Package> {
  const cache = new PackageCache();

  const packages = new Map<string, Package>();

  for (const component of model.components) {
    const dependencyPackage = cache.package(component.purl);

    packages.set(component.bomRef, dependencyPackage);
  }

  for (const dependency of model.dependencies) {
    const dependencyPackage = packages.get(dependency.ref);

    if (dependencyPackage === undefined) {
      continue;
    }

    for (const dependencyRef of dependency.dependsOn) {
      const packageDependency = packages.get(dependencyRef);

      if (packageDependency !== undefined) {
        dependencyPackage.dependsOn(packageDependency);
      }
    }
  }

  return packages;
}
