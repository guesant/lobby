import { array, record } from '../content/validation.model.ts';
import { catalogIdentity } from './catalog-identity.model.ts';
import { catalogLabels } from './catalog-labels.model.ts';
import { catalogPublished } from './catalog-published.model.ts';
import type { TechnologyGroup } from './profile.types.ts';
import { technology } from './technology.model.ts';

export function technologyGroup(
  value: unknown,
  groups: Set<string>,
  items: Set<string>,
): TechnologyGroup {
  const group = record(value, 'technology group');

  const technologies = [];

  for (const item of array(group['items'], 'technology items')) {
    const raw = record(item, 'technology');

    if (!catalogPublished(raw)) {
      continue;
    }

    const validated = technology(raw, items);

    technologies.push(validated);
  }

  return {
    id: catalogIdentity(group['id'], groups),
    labels: catalogLabels(group['labels']),
    items: technologies,
  };
}
