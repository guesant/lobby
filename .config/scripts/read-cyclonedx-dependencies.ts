import {
  array,
  record,
  requiredText,
  strings,
} from '../../website/src/lib/features/content/validation.model.ts';
import type { CycloneDXDependencyList } from './dependency-snapshot.types.ts';

export function readCycloneDXDependencies(
  value: unknown,
  rootRef: string,
): CycloneDXDependencyList {
  const rawDependencies = array(value, 'CycloneDX dependencies');

  const dependencies: CycloneDXDependencyList['dependencies'] = [];

  let rootDependencies: string[] = [];

  for (const rawDependency of rawDependencies) {
    const dependency = record(rawDependency, 'CycloneDX dependency');

    const ref = requiredText(
      dependency['ref'],
      'CycloneDX dependency reference',
    );

    const dependsOn = strings(
      dependency['dependsOn'] ?? [],
      'CycloneDX dependency references',
    );

    dependencies.push({
      dependsOn,
      ref,
    });

    if (ref === rootRef) {
      rootDependencies = dependsOn;
    }
  }

  if (rootDependencies.length === 0) {
    throw new Error('CycloneDX root dependency list is missing or empty');
  }

  return {
    dependencies,
    rootDependencies,
  };
}
