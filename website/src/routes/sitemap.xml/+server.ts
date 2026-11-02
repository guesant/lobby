import type { RequestHandler } from './$types';
import { getSiteData } from '#lib/features/content/content.server.ts';
import { sitemap } from '#lib/features/metadata/resources.server.ts';

export const prerender = true;

export const trailingSlash = 'never';

export async function GET(): Promise<Awaited<ReturnType<RequestHandler>>> {
  return new Response(sitemap(await getSiteData()), {
    headers: {
      'content-type': 'application/xml; charset=utf-8',
    },
  });
}
