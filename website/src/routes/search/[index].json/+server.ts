import {
  localizedResourceEntries,
  resourceRequest,
  searchEntries,
} from '$lib/public-resources.server.ts';
import type { EntryGenerator, RequestHandler } from './$types';

export const prerender = true;

export const trailingSlash = 'never';

export const entries: EntryGenerator = localizedResourceEntries;

export const GET: RequestHandler = resourceRequest(searchEntries);
