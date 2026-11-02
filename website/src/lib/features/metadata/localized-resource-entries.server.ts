import { getSiteData } from '../content/content.server.ts';
import { resourceEntries } from './resource-entries.server.ts';

export async function localizedResourceEntries(): Promise<
  ReturnType<typeof resourceEntries>
> {
  const data = await getSiteData();

  return resourceEntries(data);
}
