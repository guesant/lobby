import { siteOrigin } from '$lib/site-origin.ts';
import type { RequestHandler } from './$types';

export const prerender = true;

export const trailingSlash = 'never';

export const GET: RequestHandler = (): Response => {
  return new Response(
    `User-agent: *\nAllow: /\nSitemap: ${siteOrigin}/sitemap.xml\n`,
    {
      headers: {
        'content-type': 'text/plain; charset=utf-8',
      },
    },
  );
};
