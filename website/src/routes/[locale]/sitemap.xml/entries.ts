import type { EntryGenerator } from './$types';
import { getSiteData } from '#lib/features/content/content.server.ts';

export async function entries(): Promise<Awaited<ReturnType<EntryGenerator>>> {
  const data = await getSiteData();

  const result: {
    locale: string;
  }[] = [];

  for (const language of data.links.language_options) {
    result.push({
      locale: language.id,
    });
  }

  return result;
}
