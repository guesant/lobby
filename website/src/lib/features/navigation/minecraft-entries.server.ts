import { getSiteData } from '../content/content.server.ts';
import { routeEntries } from './catalog.model.ts';
import type { MinecraftEntry } from './entries.types.ts';

export async function minecraftEntries(): Promise<MinecraftEntry[]> {
  const data = await getSiteData();

  const entries: MinecraftEntry[] = [];

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
