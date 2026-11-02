import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

export async function readFederation(root: string): Promise<unknown> {
  try {
    const federationPath = resolve(
      root,
      '../.cache/federation/assets/federation.json',
    );

    const source = await readFile(federationPath, 'utf8');

    return JSON.parse(source) as unknown;
  } catch (error) {
    if (
      !(error instanceof Error) ||
      !('code' in error) ||
      error.code !== 'ENOENT'
    ) {
      throw error;
    }

    return {
      version: 1,
      items: [],
    };
  }
}
