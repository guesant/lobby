import type { PageLoadData } from '../content/content.types.ts';
import { siteOrigin } from '../navigation/origin.model.ts';
import { lanternCount } from './lantern-count.viewmodel.ts';
import type { ListingDestination } from './listing.model.ts';
import { navigationPages } from './navigation-pages.viewmodel.ts';
import { nowActivities } from './now-activities.viewmodel.ts';
import { pagesForNavigation } from './pages-for-navigation.viewmodel.ts';
import { destinationFor } from './presentation.model.ts';

export type PagePresentation = {
  navigationPages: ReturnType<typeof navigationPages>;
  nowPages: ReturnType<typeof pagesForNavigation>;
  nowActivities: ReturnType<typeof nowActivities>;
  lanternCount: number;
  promptPath: string;
  destination: ListingDestination;
};

export function pagePresentation(
  data: PageLoadData,
  origin: string = siteOrigin,
): PagePresentation {
  let promptPath = '~';

  if (data.page.id !== 'home') {
    promptPath = `~/${data.page.id}`;
  }

  const destinationContext = {
    config: data.config,
    locale: data.locale,
    interfaceName: data.interfaceName,
    origin,
  };

  return {
    navigationPages: navigationPages(data.pages),
    nowPages: pagesForNavigation(data),
    nowActivities: nowActivities(data),
    lanternCount: lanternCount(data),
    promptPath,
    destination: destinationFor.bind(null, destinationContext),
  };
}
