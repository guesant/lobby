import { record } from '../../../website/src/lib/features/content/validation.model.ts';
import { readFile } from 'node:fs/promises';

export async function readLinkReport(path: string): Promise<{
  report: Record<string, unknown>;
  unique: number;
}> {
  const source = await readFile(path, 'utf8');

  const parsed: unknown = JSON.parse(source);

  const report = record(parsed, 'link report');

  const unique = report['unique'];

  if (typeof unique !== 'number' || !Number.isInteger(unique) || unique < 0) {
    throw new Error('Invalid link report count');
  }

  return {
    report,
    unique,
  };
}
