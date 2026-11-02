import { record } from '../../website/src/lib/features/content/validation.model.ts';
import { sbomPackages } from './sbom-packages.ts';
import { readFile } from 'node:fs/promises';

export async function verifySBOM(
  directory: string,
  path: string,
): Promise<void> {
  const sbomSource = await readFile(path, 'utf8');

  const parsedSBOM: unknown = JSON.parse(sbomSource);

  const packages = sbomPackages(parsedSBOM);

  const manifestSource = await readFile(`${directory}/package.json`, 'utf8');

  const parsedManifest: unknown = JSON.parse(manifestSource);

  const manifest = record(parsedManifest, 'manifest');

  for (const section of [
    'dependencies',
    'devDependencies',
    'optionalDependencies',
  ]) {
    const entries = record(manifest[section] ?? {}, 'dependencies');

    for (const name of Object.keys(entries)) {
      if (!packages.has(name)) {
        throw new Error(`Native SBOM omitted ${directory}: ${name}`);
      }
    }
  }
}
