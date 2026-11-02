import type { Handle } from '@sveltejs/kit/hooks';
import { getSiteData } from '#lib/features/content/content.server.ts';
import { renderDocument } from '#lib/features/metadata/document.server.ts';

export async function handle(
  context: Parameters<Handle>[0],
): Promise<Response> {
  const data = await getSiteData();

  return context.resolve(context.event, {
    preload(input): boolean {
      return input.type !== 'js' && input.type !== 'font';
    },
    transformPageChunk(input): string {
      return renderDocument(input.html, data, context.event.url);
    },
  });
}
