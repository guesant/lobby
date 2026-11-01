import { aiCatalog } from '$lib/ai-catalog.server.ts';
import { getSiteData } from '$lib/site-data.server.ts';
import type { RequestHandler } from './$types';

export const prerender = true;

export const trailingSlash = 'never';

export const GET: RequestHandler = async (): Promise<Response> => {
  return Response.json(aiCatalog(await getSiteData()), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
    },
  });
};
