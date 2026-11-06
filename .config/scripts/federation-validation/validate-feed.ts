import {
  array,
  record,
} from '../../../website/src/lib/features/content/validation.model.ts';
import type { Feed, Source } from '../federation.types.ts';
import { resumeTechnologies } from '../federation/resume-technologies.ts';
import { sourceID } from './source-id.ts';
import { validateEntry } from './validate-entry.ts';

export function validateFeed(value: unknown, source: Source): Feed {
  const feed = record(value, 'federation feed');

  if (
    feed['version'] !== 1 ||
    feed['source'] !== source.id ||
    !Array.isArray(feed['items']) ||
    feed['items'].length > 10000
  ) {
    throw new Error(`Invalid feed: ${source.id}`);
  }

  const sourceName = sourceID(source.id);

  const ids = new Set<string>();

  const items = [];

  for (const item of array(feed['items'], 'federation items')) {
    const entry = validateEntry(item, source, ids);

    items.push(entry);
  }

  return {
    version: 1,
    source: sourceName,
    items,
    ...resumeTechnologies(feed, source),
  };
}
