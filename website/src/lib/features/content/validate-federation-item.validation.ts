import type { FederationItem } from './content.types.ts';
import { federationIdentity } from './federation-identity.validation.ts';
import { federationSummary } from './federation-summary.validation.ts';
import { federationURL } from './federation-url.validation.ts';
import type { FederationIdentity } from './federation-validation.types.ts';
import { validateFederationMetadata } from './validate-federation-metadata.validation.ts';
import { record, requiredText, strings } from './validation.model.ts';

export function validateFederationItem(
  rawItem: unknown,
  index: number,
  identities: Set<string>,
): FederationItem {
  const label = `federation.items[${String(index)}]`;

  const item = record(rawItem, label);

  const identity: FederationIdentity = federationIdentity(item, label);

  const key = `${identity.source}:${identity.id}:${identity.language}`;

  if (identities.has(key)) {
    throw new Error(`Duplicate federation item: ${key}`);
  }

  identities.add(key);

  return {
    ...identity,
    title: requiredText(item['title'], `${label}.title`),
    summary: federationSummary(item['summary'], label),
    url: federationURL(item['url'], label),
    tags: strings(item['tags'], `${label}.tags`),
    metadata: validateFederationMetadata(item['metadata'], label, identity),
  };
}
