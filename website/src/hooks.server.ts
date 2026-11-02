import { preloadRequest } from './lib/browser/preload-request.ts';
import { transformPageChunk } from './lib/browser/transform-page-chunk.ts';
import type { Handle } from '@sveltejs/kit/hooks';
import { getSiteData } from '#lib/features/content/content.server.ts';

export async function handle(
  context: Parameters<Handle>[0],
): Promise<Response> {
  const data = await getSiteData();

  const transform = transformPageChunk.bind(null, data, context.event.url);

  return context.resolve(context.event, {
    preload: preloadRequest,
    transformPageChunk: transform,
  });
}
