import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { parse } from 'yaml';

export async function readYaml(root: string, name: string): Promise<unknown> {
  const filePath = resolve(root, `src/data/${name}.yaml`);

  const source = await readFile(filePath, 'utf8');

  return parse(source) as unknown;
}
