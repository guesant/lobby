import { array, record } from '../content/validation.model.ts';
import { catalogPublished } from './catalog-published.model.ts';
import type { TechnologyGroup } from './profile.types.ts';
import { technologyGroup } from './technology-group.model.ts';

export function technologyGroups(value: unknown): TechnologyGroup[] {
  const groups = new Set<string>();

  const items = new Set<string>();

  const output: TechnologyGroup[] = [];

  for (const group of array(value, 'technologies catalog')) {
    const raw = record(group, 'technology group');

    if (!catalogPublished(raw)) {
      continue;
    }

    const validated = technologyGroup(raw, groups, items);

    output.push(validated);
  }

  return output;
}
