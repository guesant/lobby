import { searchEntries } from '../../../lib/features/search/search-index.server.ts';
import type { EntryGenerator, RequestHandler } from './$types';
import {
  localizedResourceEntries,
  resourceRequest,
} from '#lib/features/metadata/resources.server.ts';

export const prerender = true;

export const trailingSlash = 'never';

export const entries: EntryGenerator = localizedResourceEntries;

export const GET: RequestHandler = resourceRequest(searchEntries);
