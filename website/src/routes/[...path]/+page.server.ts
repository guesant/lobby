import type { PageLoadData } from '../../lib/features/content/content.types.ts';
import type { PageServerLoadEvent } from './$types';
import { error } from '@sveltejs/kit';
import { getSiteData } from '#lib/features/content/content.server.ts';
import { loadPageData } from '#lib/features/content/page.controller.server.ts';

export { minecraftEntries as entries } from '#lib/features/navigation/entries.server.ts';

export async function load(event: PageServerLoadEvent): Promise<PageLoadData> {
  const params = event.params;

  if (params.path) {
    const page = await loadPageData(params.path);

    if (!page) {
      error(404, 'Page not found');
    }

    return page;
  }

  const data = await getSiteData();

  const page = await loadPageData(data.links.language_preference.default, true);

  if (!page) {
    error(404, 'Page not found');
  }

  return page;
}
