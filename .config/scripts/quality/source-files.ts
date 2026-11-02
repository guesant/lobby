import { readdir } from 'node:fs/promises';
import { resolve } from 'node:path';

export async function sourceFiles(directory: string): Promise<string[]> {
  const files: string[] = [];

  for (const entry of await readdir(directory, {
    withFileTypes: true,
  })) {
    if (
      [
        'node_modules',
        '.git',
        '.local',
        '.cache',
        '.svelte-kit',
        '.venv',
        '.pnpm-store',
      ].includes(entry.name)
    ) {
      continue;
    }

    const path = resolve(directory, entry.name);

    if (entry.isDirectory()) {
      const nestedFiles = await sourceFiles(path);

      files.push(...nestedFiles);
    } else if (
      /\.(?:[cm]?[jt]s|svelte|css|jsonc?|ya?ml|md|html)$/.test(entry.name) &&
      !entry.name.includes('lock')
    ) {
      files.push(path);
    }
  }

  return files;
}
