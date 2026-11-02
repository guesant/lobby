import type { RequestHandler } from './$types';
import { getSiteData } from '#lib/features/content/content.server.ts';
import { aiCatalog } from '#lib/features/metadata/ai-catalog.server.ts';

export const prerender = true;

export const trailingSlash = 'never';

export async function GET(): Promise<Awaited<ReturnType<RequestHandler>>> {
  return Response.json(aiCatalog(await getSiteData()), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
    },
  });
}
