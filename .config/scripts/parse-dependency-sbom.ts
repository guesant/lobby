import {
  record,
  requiredText,
} from '../../website/src/lib/features/content/validation.model.ts';
import type { CycloneDXModel } from './dependency-snapshot.types.ts';
import { readCycloneDXComponents } from './read-cyclonedx-components.ts';
import { readCycloneDXDependencies } from './read-cyclonedx-dependencies.ts';

export function parseDependencySBOM(value: unknown): CycloneDXModel {
  const sbom = record(value, 'CycloneDX SBOM');

  const metadata = record(sbom['metadata'], 'CycloneDX metadata');

  const rootComponent = record(
    metadata['component'],
    'CycloneDX root component',
  );

  const rootRef = requiredText(
    rootComponent['bom-ref'],
    'CycloneDX root reference',
  );

  const components = readCycloneDXComponents(sbom['components']);

  const dependencyList = readCycloneDXDependencies(
    sbom['dependencies'],
    rootRef,
  );

  return {
    components,
    dependencies: dependencyList.dependencies,
    rootDependencies: dependencyList.rootDependencies,
  };
}
