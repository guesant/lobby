import type { SiteData } from './content.types.ts';
import { siteCache } from './content-cache.server.ts';
import { contentSignature } from './content-signature.server.ts';
import { readDocuments } from './read-documents.server.ts';
import { resolve } from 'node:path';

export { getFederationStatus } from './federation-status.server.ts';

export async function getSiteData(
  websiteRoot: string = process.cwd(),
): Promise<SiteData> {
  websiteRoot = resolve(websiteRoot);

  const signature = await contentSignature(websiteRoot);

  const cached = siteCache.get(websiteRoot);

  if (cached?.signature === signature) {
    return cached.data;
  }

  const data = await readDocuments(websiteRoot);

  siteCache.set(websiteRoot, {
    signature,
    data,
  });

  return data;
}
