import type { SiteData } from '../features/content/content.types.ts';
import { renderDocument } from '../features/metadata/document.server.ts';

export function transformPageChunk(
  data: SiteData,
  url: URL,
  input: {
    html: string;
  },
): string {
  return renderDocument(input.html, data, url);
}
