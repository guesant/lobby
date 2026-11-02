import { federationType } from './federation-type.validation.ts';
import type { FederationIdentity } from './federation-validation.types.ts';
import type { UnknownRecord } from './validation.model.ts';
import { requiredText } from './validation.model.ts';

export function federationIdentity(
  item: UnknownRecord,
  label: string,
): FederationIdentity {
  const id = requiredText(item['id'], `${label}.id`);

  if (!/^[a-z0-9][a-z0-9_-]{0,127}$/.test(id)) {
    throw new Error(`Invalid ${label}.id`);
  }

  const source = requiredText(item['source'], `${label}.source`);

  if (source !== 'blog' && source !== 'resume') {
    throw new Error(`Invalid ${label}.source`);
  }

  const language = requiredText(item['language'], `${label}.language`);

  if (!/^[a-z]{2,3}(-[a-z0-9]{2,8})*$/.test(language)) {
    throw new Error(`Invalid ${label}.language`);
  }

  return {
    id,
    source,
    language,
    type: federationType(item['type'], `${label}.type`),
  };
}
