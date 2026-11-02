import type { FederationItem } from './content.types.ts';
import type { FederationContentIdentity } from './federation-validation.types.ts';
import { validateFederationContentURL } from './validate-federation-content-url.validation.ts';
import { record, requiredText, strings } from './validation.model.ts';

export function validateFederationMetadata(
  value: unknown,
  label: string,
  identity: FederationContentIdentity,
): FederationItem['metadata'] {
  const raw = record(value, `${label}.metadata`);

  const allowed = new Set([
    'date',
    'updated',
    'categories',
    'position',
    'degree',
    'area',
    'start_date',
    'end_date',
    'content_url',
  ]);

  const metadata: FederationItem['metadata'] = {};

  for (const [
    key,
    entry,
  ] of Object.entries(raw)) {
    if (!allowed.has(key)) {
      continue;
    }

    if (key === 'categories') {
      metadata[key] = strings(entry, `${label}.metadata.categories`);
      continue;
    }

    const field = requiredText(entry, `${label}.metadata.${key}`);

    if (key === 'content_url') {
      metadata[key] = validateFederationContentURL(field, label, identity);
      continue;
    }

    metadata[key] = field;
  }

  return metadata;
}
