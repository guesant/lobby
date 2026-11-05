import {
  array,
  record,
} from '../../website/src/lib/features/content/validation.model.ts';
import { readFile, writeFile } from 'node:fs/promises';

export async function annotateSarif(
  path: string,
  category: string,
): Promise<number> {
  const source = await readFile(path, 'utf8');

  const parsed: unknown = JSON.parse(source);

  const document = record(parsed, 'SARIF report');

  const runs = array(document['runs'], 'SARIF runs');

  let resultCount = 0;

  for (const [
    index,
    rawRun,
  ] of runs.entries()) {
    const run = record(rawRun, 'SARIF run');

    const results = array(run['results'] ?? [], 'SARIF results');

    const runNumber = String(index + 1);

    resultCount += results.length;
    run['automationDetails'] = {
      id: `${category}/${runNumber}`,
    };
  }

  const serialized = JSON.stringify(document);

  await writeFile(path, serialized);

  return resultCount;
}
