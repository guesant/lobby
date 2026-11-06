import type { SiteData } from '../content/content.types.ts';
import { localEditorialItems } from '../content/local-editorial-items.model.ts';
import type { PublicProfile } from './profile.types.ts';

export function profileInterests(data: SiteData): PublicProfile['interests'] {
  const items = localEditorialItems(data, 'interests', 'en');

  const interests: PublicProfile['interests'] = [];

  for (const item of items) {
    if (item.language === 'en') {
      interests.push({
        id: item.id,
        title: item.title,
        description: item.summary,
      });
    }
  }

  return interests;
}
