import { dependencySnapshotTargets } from './dependency-snapshot-targets.ts';
import { runCommand } from './process.ts';
import { verifySBOM } from './verify-sbom.ts';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

export async function dependencySBOMs(): Promise<string[]> {
  const paths: string[] = [];

  for (const {
    directory
  } of dependencySnapshotTargets) {
    const path = resolve(
      '.local/reports/sbom',
      directory,
      'dependencies.cdx.json',
    );

    const directoryPath = resolve(path, '..');

    await mkdir(directoryPath, {
      recursive: true,
    });
    await runCommand('pnpm', [
      '--dir',
      directory,
      'sbom',
      '--lockfile-only',
      '--sbom-format',
      'cyclonedx',
      '--sbom-spec-version',
      '1.6',
      '--out',
      path,
    ]);
    await verifySBOM(directory, path);
    paths.push(path);
  }

  return paths;
}
