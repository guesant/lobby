import type { RequestHandler } from './$types';
import { siteOrigin } from '#lib/features/navigation/origin.model.ts';

export const prerender = true;

export const trailingSlash = 'never';

export function GET(): ReturnType<RequestHandler> {
  return new Response(
    `User-agent: *\nAllow: /\nSitemap: ${siteOrigin}/sitemap.xml\n`,
    {
      headers: {
        'content-type': 'text/plain; charset=utf-8',
      },
    },
  );
}
