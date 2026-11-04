import type { SiteData } from '../content/content.types.ts';
import { pagesFor } from './catalog-pages-for.model.ts';

export function routeEntries(data: SiteData): string[] {
  const output: string[] = [];

  for (const language of data.links.language_options) {
    const voxel = pagesFor(data, language.id, 'voxel');

    const terminal = pagesFor(data, language.id, 'terminal');

    for (const page of [
      ...voxel,
      ...terminal,
    ]) {
      if (!page.fallback) {
        const entry = page.url.slice(1, -1);

        output.push(entry);
      }
    }
  }

  return output;
}
