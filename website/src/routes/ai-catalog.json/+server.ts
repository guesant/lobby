import type { RequestHandler } from './$types';
import { getSiteData } from '#lib/features/content/content.server.ts';
import { aiCatalog } from '#lib/features/metadata/ai-catalog.server.ts';

export const prerender = true;

export const trailingSlash = 'never';

export async function GET(): Promise<Awaited<ReturnType<RequestHandler>>> {
  const data = await getSiteData();

  const catalog = aiCatalog(data);

  return Response.json(catalog, {
    headers: {
      'content-type': 'application/json; charset=utf-8',
    },
  });
}
