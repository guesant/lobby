import { getSiteData } from '../content/content.server.ts';

export async function privacyEntries(): Promise<
  {
    locale: string;
  }[]
> {
  const data = await getSiteData();

  const entries: {
    locale: string;
  }[] = [];

  for (const language of data.links.language_options) {
    entries.push({
      locale: language.id,
    });
  }

  return entries;
}
