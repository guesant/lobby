import type { StatisticsSnapshot } from '../../../website/src/lib/features/content/content.types.ts';
import { validateStatistics } from '../../../website/src/lib/features/content/statistics.validation.ts';
import { readFile } from 'node:fs/promises';
import { parse } from 'yaml';

export async function readPrevious(
  outputPath: string,
): Promise<Record<string, StatisticsSnapshot>> {
  try {
    const source = await readFile(outputPath, 'utf8');

    if (!source) {
      return {};
    }

    const parsed: unknown = parse(source);

    return validateStatistics(parsed);
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return {};
    }

    throw error;
  }
}
