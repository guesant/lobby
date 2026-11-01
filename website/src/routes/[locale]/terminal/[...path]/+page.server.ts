import { loadPageData } from '$lib/page-data.server.ts';
import { getSiteData, pagesFor } from '$lib/site-data.server.ts';
import type { EntryGenerator, PageServerLoad } from './$types';
import type { PageLoadData } from '$lib/site-data.ts';

export const prerender = true;

export const trailingSlash = 'always';

export const entries: EntryGenerator = async (): Promise<
  {
    locale: string;
    path: string;
  }[]
> => {
  const data = await getSiteData();

  return data.links.language_options.flatMap(
    (
      language,
    ): {
      locale: string;
      path: string;
    }[] => {
      const prefix = `${language.path}terminal/`;

      return pagesFor(data, language.id, 'terminal')
        .filter((page): boolean => {
          return !page.fallback;
        })
        .map(
          (
            page,
          ): {
            locale: string;
            path: string;
          } => {
            return {
              locale: language.id,
              path: page.url.slice(prefix.length)
                .replace(/\/$/, ''),
            };
          },
        );
    },
  );
};

export const load: PageServerLoad = async ({
  params,
}): Promise<PageLoadData> => {
  return loadPageData(
    [
      params.locale,
      'terminal',
      params.path,
    ]
      .filter(Boolean)
      .join('/'),
  );
};
