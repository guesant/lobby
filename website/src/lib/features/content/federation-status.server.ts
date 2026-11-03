import { federationStatuses } from './federation-status.model.ts';
import type { FederationStatus } from './federation-status.types.ts';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

export async function getFederationStatus(
  websiteRoot: string = process.cwd(),
): Promise<FederationStatus[]> {
  try {
    const statusPath = resolve(
      websiteRoot,
      '../.cache/federation/assets/status.json',
    );

    const source = await readFile(statusPath, 'utf8');

    const value: unknown = JSON.parse(source);

    return federationStatuses(value);
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return [];
    }

    throw error;
  }
}
