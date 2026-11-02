import type { StatisticsSnapshot } from '../../../website/src/lib/features/content/content.types.ts';
import { mkdir, rename, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { stringify } from 'yaml';

export async function writeStatistics(
  outputPath: string,
  next: Record<string, StatisticsSnapshot>,
): Promise<void> {
  const outputDirectory = dirname(outputPath);

  await mkdir(outputDirectory, {
    recursive: true,
  });

  const temporary = `${outputPath}.${String(process.pid)}.tmp`;

  const serialized = stringify(next);

  await writeFile(temporary, serialized, {
    mode: 0o644,
  });
  await rename(temporary, outputPath);
}
