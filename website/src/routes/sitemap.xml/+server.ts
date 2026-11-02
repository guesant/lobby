import type { RequestHandler } from './$types';
import { getSiteData } from '#lib/features/content/content.server.ts';
import { sitemap } from '#lib/features/metadata/resources.server.ts';

export const prerender = true;

export const trailingSlash = 'never';

export async function GET(): Promise<Awaited<ReturnType<RequestHandler>>> {
  const data = await getSiteData();

  const document = sitemap(data);

  return new Response(document, {
    headers: {
      'content-type': 'application/xml; charset=utf-8',
    },
  });
}
