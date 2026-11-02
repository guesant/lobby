import { canonicalFormat } from './canonical-format.ts';
import { sourceFiles } from './source-files.ts';
import { readFile, writeFile } from 'node:fs/promises';

export async function formatFiles(fix: boolean): Promise<void> {
  const failures: string[] = [];

  const workingDirectory = process.cwd();

  for (const path of await sourceFiles(workingDirectory)) {
    const source = await readFile(path, 'utf8');

    const output = await canonicalFormat(source, path);

    if (source === output) {
      continue;
    }

    if (fix) {
      await writeFile(path, output);
    } else {
      failures.push(path);
    }
  }

  if (failures.length) {
    throw new Error(`Formatting required:\n${failures.join('\n')}`);
  }
}
