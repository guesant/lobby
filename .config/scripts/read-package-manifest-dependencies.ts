import { record } from '../../website/src/lib/features/content/validation.model.ts';
import type { PackageManifestDependencies } from './dependency-snapshot.types.ts';
import { readFile } from 'node:fs/promises';

export async function readPackageManifestDependencies(
  directory: string,
): Promise<PackageManifestDependencies> {
  const path = `${directory}/package.json`;

  const source = await readFile(path, 'utf8');

  const parsed: unknown = JSON.parse(source);

  const manifest = record(parsed, 'Package manifest');

  const runtime = record(
    manifest['dependencies'] ?? {},
    'Runtime dependencies',
  );

  const optional = record(
    manifest['optionalDependencies'] ?? {},
    'Optional dependencies',
  );

  const development = record(
    manifest['devDependencies'] ?? {},
    'Development dependencies',
  );

  return {
    development,
    optional,
    runtime,
  };
}
