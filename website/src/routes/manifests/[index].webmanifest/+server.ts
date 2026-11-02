import type { EntryGenerator, RequestHandler } from './$types';
import {
  localizedResourceEntries,
  resourceRequest,
  webManifest,
} from '#lib/features/metadata/resources.server.ts';

export const prerender = true;

export const trailingSlash = 'never';

export const entries: EntryGenerator = localizedResourceEntries;

export const GET: RequestHandler = resourceRequest(
  webManifest,
  'application/manifest+json',
);
