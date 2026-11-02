import {
  array,
  record,
  requiredText,
} from '../../website/src/lib/features/content/validation.model.ts';
import { runCommand } from './process.ts';
import { mkdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

function sbomPackages(value: unknown): Set<string> {
  const document = record(value, 'CycloneDX document');

  if (document['bomFormat'] !== 'CycloneDX') {
    throw new Error('Expected native CycloneDX SBOM');
  }

  const packages = new Set<string>();

  for (const raw of array(document['components'], 'SBOM components')) {
    const component = record(raw, 'SBOM component');

    const purl = requiredText(component['purl'], 'SBOM package URL');

    const match = /^pkg:npm\/(.+)@([^@?#]+)$/.exec(purl);

    if (!match?.[1]) {
      throw new Error(`Invalid npm package URL: ${purl}`);
    }

    packages.add(decodeURIComponent(match[1]));
  }

  return packages;
}

export async function dependencySBOMs(): Promise<string[]> {
  const paths: string[] = [];

  for (const directory of [
    'website',
    '.config',
    '.config/audit',
  ]) {
    const path = resolve(
      '.local/reports/sbom',
      directory,
      'dependencies.cdx.json',
    );

    await mkdir(resolve(path, '..'), {
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

async function verifySBOM(directory: string, path: string): Promise<void> {
  const packages = sbomPackages(
    JSON.parse(await readFile(path, 'utf8')) as unknown,
  );

  const manifest = record(
    JSON.parse(await readFile(`${directory}/package.json`, 'utf8')) as unknown,
    'manifest',
  );

  for (const section of [
    'dependencies',
    'devDependencies',
    'optionalDependencies',
  ]) {
    for (const name of Object.keys(
      record(manifest[section] ?? {}, 'dependencies'),
    )) {
      if (!packages.has(name)) {
        throw new Error(`Native SBOM omitted ${directory}: ${name}`);
      }
    }
  }
}
