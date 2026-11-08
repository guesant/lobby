import type { SiteData } from '../content/content.types.ts';

export function resourceEntries(data: SiteData): {
  index: string;
}[] {
  const output: {
    index: string;
  }[] = [];

  for (const language of data.links.language_options) {
    output.push({
      index: `${language.id}-voxel`,
    });
  }

  return output;
}
