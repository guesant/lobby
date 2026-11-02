import { federationStatuses } from '../../../website/src/lib/features/content/federation-status.model.ts';
import { readFile } from 'node:fs/promises';

export async function priorStatus(
  path: string,
  id: 'blog' | 'resume',
): Promise<string | null> {
  try {
    const source = await readFile(path, 'utf8');

    const value: unknown = JSON.parse(source);

    const [
      status,
    ] = federationStatuses({
      version: 1,
      sources: [
        value,
      ],
    });

    if (status?.id === id) {
      return status.lastSuccessfulFetchAt;
    }

    throw new Error('Federation status identity mismatch');
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return null;
    }

    throw error;
  }
}
