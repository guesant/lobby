import { optionalTechnologyCatalog } from '../../../website/src/lib/features/profile/optional-technology-catalog.model.ts';
import type { TechnologyGroup } from '../../../website/src/lib/features/profile/profile.types.ts';
import type { Source } from '../federation.types.ts';

export function resumeTechnologies(
  feed: Record<string, unknown>,
  source: Source,
): {
  technologies?: TechnologyGroup[];
} {
  if (source.id !== 'resume') {
    return {};
  }

  return optionalTechnologyCatalog(feed['technologies']);
}
