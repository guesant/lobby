import { loadPageData } from '$lib/page-data.server.ts';
import { getSiteData, routeEntries } from '$lib/site-data.server.ts';
import type { PageLoadData } from '$lib/site-data.ts';
import type { EntryGenerator, PageServerLoad } from './$types';

export const prerender = true;

export const trailingSlash = 'always';

export const entries: EntryGenerator = async (): Promise<
  {
    path: string;
  }[]
> => {
  const data = await getSiteData();

  return [
    '',
    ...routeEntries(data),
  ]
    .filter((path): boolean => {
      return path.split('/')[1] !== 'terminal';
    })
    .map(
      (
        path,
      ): {
        path: string;
      } => {
        return {
          path,
        };
      },
    );
};

export const load: PageServerLoad = async ({
  params,
}): Promise<PageLoadData> => {
  if (params.path) {
    return loadPageData(params.path);
  }

  const data = await getSiteData();

  return loadPageData(data.links.language_preference.default, true);
};
