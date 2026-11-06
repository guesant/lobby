import type { TechnologyGroup } from '../../../website/src/lib/features/profile/profile.types.ts';
import type { Feed } from '../federation.types.ts';

export function federatedTechnologies(feeds: Feed[]): {
  technologies?: TechnologyGroup[];
} {
  for (const feed of feeds) {
    if (feed.source === 'resume' && feed.technologies !== undefined) {
      return {
        technologies: feed.technologies,
      };
    }
  }

  return {};
}
