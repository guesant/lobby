import { getSiteData } from '$lib/site-data.server.ts';
import { sitemap } from '$lib/public-resources.server.ts';
import type { RequestHandler } from './$types';

export const prerender = true;

export const trailingSlash = 'never';

export const GET: RequestHandler = async (): Promise<Response> => {
  return new Response(sitemap(await getSiteData()), {
    headers: {
      'content-type': 'application/xml; charset=utf-8',
    },
  });
};
