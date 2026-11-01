import { llmsText } from '$lib/ai-catalog.server.ts';
import { getSiteData } from '$lib/site-data.server.ts';
import type { RequestHandler } from './$types';

export const prerender = true;

export const trailingSlash = 'never';

export const GET: RequestHandler = async (): Promise<Response> => {
  return new Response(llmsText(await getSiteData()), {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
    },
  });
};
