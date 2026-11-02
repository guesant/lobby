import type { PageLoadData } from '../../../../lib/features/content/content.types.ts';
import type { PageServerLoadEvent } from './$types';
import { error } from '@sveltejs/kit';
import { loadPageData } from '#lib/features/content/page.controller.server.ts';

export { terminalEntries as entries } from '#lib/features/navigation/entries.server.ts';

export async function load(event: PageServerLoadEvent): Promise<PageLoadData> {
  const params = event.params;

  const routeParts = [
    params.locale,
    'terminal',
    params.path,
  ].filter(Boolean);

  const route = routeParts.join('/');

  const page = await loadPageData(route);

  if (!page) {
    error(404, 'Page not found');
  }

  return page;
}
