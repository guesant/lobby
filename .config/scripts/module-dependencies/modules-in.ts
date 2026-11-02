import { readdir } from 'node:fs/promises';
import { resolve } from 'node:path';

export async function modulesIn(directory: string): Promise<string[]> {
  const files: string[] = [];

  for (const entry of await readdir(directory, {
    withFileTypes: true,
  })) {
    const file = resolve(directory, entry.name);

    if (entry.isDirectory()) {
      const nestedFiles = await modulesIn(file);

      files.push(...nestedFiles);
    } else if (
      /\.(?:[cm]?[jt]s|svelte)$/.test(entry.name) &&
      !entry.name.endsWith('.d.ts')
    ) {
      files.push(file);
    }
  }

  return files;
}
