import { stat } from 'node:fs/promises';
import { resolve } from 'node:path';

export async function contentFileVersion(
  root: string,
  file: string,
): Promise<string> {
  try {
    const filePath = resolve(root, file);

    const metadata = await stat(filePath, {
      bigint: true,
    });

    return `${file}:${String(metadata.size)}:${String(metadata.mtimeNs)}`;
  } catch (error) {
    if (
      file.endsWith('federation.json') &&
      error instanceof Error &&
      'code' in error &&
      error.code === 'ENOENT'
    ) {
      return `${file}:missing`;
    }

    throw error;
  }
}
