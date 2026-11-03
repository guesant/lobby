import type { ListingDestination } from './listing.types.ts';
import type { navigationPages } from './navigation-pages.viewmodel.ts';
import type { nowActivities } from './now-activities.viewmodel.ts';
import type { pagesForNavigation } from './pages-for-navigation.viewmodel.ts';

export type PagePresentation = {
  navigationPages: ReturnType<typeof navigationPages>;
  nowPages: ReturnType<typeof pagesForNavigation>;
  nowActivities: ReturnType<typeof nowActivities>;
  lanternCount: number;
  promptPath: string;
  destination: ListingDestination;
};
