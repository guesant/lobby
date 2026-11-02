import { validateStatistics } from '../../../website/src/lib/features/content/statistics.validation.ts';
import { statisticsPath } from './constants.ts';
import { readFile } from 'node:fs/promises';
import { parse } from 'yaml';

export async function validateStatisticsFile(): Promise<void> {
  const source = await readFile(statisticsPath, 'utf8');

  const parsed: unknown = parse(source);

  validateStatistics(parsed);
}
