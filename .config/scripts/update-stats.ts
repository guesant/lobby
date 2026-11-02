import { updateStats } from './update-stats/update-stats.ts';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export { updateStats } from './update-stats/update-stats.ts';

const entryPath = process.argv[1];

let entryURL: string | undefined;

if (entryPath) {
  const resolvedEntryPath = resolve(entryPath);

  entryURL = pathToFileURL(resolvedEntryPath).href;
}

if (entryURL && import.meta.url === entryURL) {
  const result = await updateStats();

  const serializedResult = JSON.stringify(result);

  console.log(serializedResult);
}
