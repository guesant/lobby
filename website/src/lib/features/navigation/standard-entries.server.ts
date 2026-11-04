import { getSiteData } from '../content/content.server.ts';
import { routeEntries } from './catalog.model.ts';
import type { StandardEntry } from './entries.types.ts';

export async function standardEntries(): Promise<StandardEntry[]> {
  const data = await getSiteData();

  const entries: StandardEntry[] = [];

  for (const path of [
    '',
    ...routeEntries(data),
  ]) {
    if (path.split('/')[1] !== 'terminal') {
      entries.push({
        path,
      });
    }
  }

  return entries;
}
