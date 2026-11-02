import { readdir } from 'node:fs/promises';

export async function workflowFiles(directory: string): Promise<string[]> {
  const files: string[] = [];

  for (const entry of await readdir(directory, {
    withFileTypes: true,
  })) {
    const path = `${directory}/${entry.name}`;

    if (entry.isDirectory()) {
      const nestedFiles = await workflowFiles(path);

      files.push(...nestedFiles);
    } else if (/\.ya?ml$/.test(entry.name)) {
      files.push(path);
    }
  }

  return files;
}
