import type { RequestHandler } from './$types';
import { getSiteData } from '#lib/features/content/content.server.ts';
import { llmsText } from '#lib/features/metadata/ai-catalog.server.ts';

export const prerender = true;

export const trailingSlash = 'never';

export async function GET(): Promise<Awaited<ReturnType<RequestHandler>>> {
  return new Response(llmsText(await getSiteData()), {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
    },
  });
}
