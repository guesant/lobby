import type { RequestHandler } from './$types';
import { getSiteData } from '#lib/features/content/content.server.ts';
import { llmsText } from '#lib/features/metadata/ai-catalog.server.ts';

export const prerender = true;

export const trailingSlash = 'never';

export async function GET(): Promise<Awaited<ReturnType<RequestHandler>>> {
  const data = await getSiteData();

  const document = llmsText(data);

  return new Response(document, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
    },
  });
}
