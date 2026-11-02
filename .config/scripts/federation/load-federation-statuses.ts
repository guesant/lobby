import type { Source } from '../federation.types.ts';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

export async function loadFederationStatuses(
  sources: Source[],
): Promise<unknown[]> {
  const statuses: unknown[] = [];

  for (const source of sources) {
    const statusPath = resolve('.cache/federation', `${source.id}.status.json`);

    const statusText = await readFile(statusPath, 'utf8');

    const status: unknown = JSON.parse(statusText);

    statuses.push(status);
  }

  return statuses;
}
