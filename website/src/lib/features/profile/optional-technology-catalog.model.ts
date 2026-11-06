import type { TechnologyGroup } from './profile.types.ts';
import { technologyGroups } from './technology-groups.model.ts';

export function optionalTechnologyCatalog(value: unknown): {
  technologies?: TechnologyGroup[];
} {
  if (value === undefined) {
    return {};
  }

  return {
    technologies: technologyGroups(value),
  };
}
