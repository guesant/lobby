import { rename, writeFile } from 'node:fs/promises';

export async function atomicJSON(path: string, value: unknown): Promise<void> {
  const serialized = JSON.stringify(value);

  await writeFile(`${path}.tmp`, serialized);
  await rename(`${path}.tmp`, path);
}
