import { record, requiredText } from '../content/validation.model.ts';
import { catalogIdentity } from './catalog-identity.model.ts';
import { catalogURL } from './catalog-url.model.ts';
import type { Technology } from './profile.types.ts';

export function technology(value: unknown, ids: Set<string>): Technology {
  const item = record(value, 'technology');

  return {
    id: catalogIdentity(item['id'], ids),
    name: requiredText(item['name'], 'technology name'),
    url: catalogURL(item['url']),
  };
}
