import type { FederationItem } from '../../../website/src/lib/features/content/content.types.ts';
import { record } from '../../../website/src/lib/features/content/validation.model.ts';
import type { Source } from '../federation.types.ts';
import { federationMetadataKeys } from './constants.ts';
import { contentURL } from './content-url.ts';
import { metadataCategories } from './metadata-categories.ts';
import { text } from './text.ts';

export function metadataFor(
  entry: Record<string, unknown>,
  source: Source,
): FederationItem['metadata'] {
  const metadata: FederationItem['metadata'] = {};

  const sourceMetadata = record(entry['metadata'] ?? {}, 'federation metadata');

  for (const [
    key,
    value,
  ] of Object.entries(sourceMetadata)) {
    if (!federationMetadataKeys.has(key)) {
      continue;
    }

    if (key === 'categories') {
      metadata[key] = metadataCategories(value);
      continue;
    }

    const content = text(value, 2048);

    if (key === 'content_url') {
      metadata[key] = contentURL(content, source, entry['type']);
      continue;
    }

    metadata[key] = content;
  }

  return metadata;
}
