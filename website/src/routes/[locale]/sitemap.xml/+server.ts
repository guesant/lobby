import { error } from '@sveltejs/kit';
import { getSiteData } from '$lib/site-data.server.ts';
import { sitemap } from '$lib/public-resources.server.ts';
import type { EntryGenerator, RequestHandler } from './$types';

export const prerender = true;

export const trailingSlash = 'never';

export const entries: EntryGenerator = async (): Promise<
  {
    locale: string;
  }[]
> => {
  const data = await getSiteData();

  return data.links.language_options.map(
    (
      language,
    ): {
      locale: string;
    } => {
      return {
        locale: language.id,
      };
    },
  );
};

export const GET: RequestHandler = async ({
  params
}): Promise<Response> => {
  const data = await getSiteData();

  if (
    !data.links.language_options.some((language): boolean => {
      return language.id === params.locale;
    })
  ) {
    error(404, 'Unknown sitemap');
  }

  return new Response(sitemap(data, params.locale), {
    headers: {
      'content-type': 'application/xml; charset=utf-8',
    },
  });
};
