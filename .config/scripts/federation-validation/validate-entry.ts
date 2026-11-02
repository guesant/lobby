import type { FederationItem } from '../../../website/src/lib/features/content/content.types.ts';
import { record } from '../../../website/src/lib/features/content/validation.model.ts';
import type { Source } from '../federation.types.ts';
import { canonicalURL } from './canonical-url.ts';
import { entryIdentity } from './entry-identity.ts';
import { entryTags } from './entry-tags.ts';
import { federationSource } from './federation-source.ts';
import { itemType } from './item-type.ts';
import { metadataFor } from './metadata-for.ts';
import { publicTitle } from './public-title.ts';
import { text } from './text.ts';

export function validateEntry(
  value: unknown,
  source: Source,
  ids: Set<string>,
): FederationItem {
  const entry = record(value, 'federation item');

  return {
    ...entryIdentity(entry, ids),
    source: federationSource(source.id),
    type: itemType(entry['type']),
    title: publicTitle(entry),
    summary: text(entry['summary']),
    url: canonicalURL(entry['url'], source),
    tags: entryTags(entry['tags']),
    metadata: metadataFor(entry, source),
  };
}
