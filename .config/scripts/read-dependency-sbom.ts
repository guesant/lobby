import type { CycloneDXModel } from './dependency-snapshot.types.ts';
import { parseDependencySBOM } from './parse-dependency-sbom.ts';
import { readFile } from 'node:fs/promises';

export async function readDependencySBOM(
  path: string,
): Promise<CycloneDXModel> {
  const source = await readFile(path, 'utf8');

  const parsed: unknown = JSON.parse(source);

  return parseDependencySBOM(parsed);
}
