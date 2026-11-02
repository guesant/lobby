import type {
  DisplayLinkRecord,
  PageLoadData,
  PageRecord,
} from '../content/content.types.ts';
import { requiredText } from '../content/validation.model.ts';
import { siteOrigin } from '../navigation/origin.model.ts';
import type { ListingDestination } from './listing.model.ts';
import { destinationFor } from './presentation.model.ts';

type NavigationPage = PageRecord & {
  directory: string;
};

type UpdatePage = PageRecord & {
  nowLinks: DisplayLinkRecord[];
};

type PagePresentation = {
  navigationPages: NavigationPage[];
  nowPages: UpdatePage[];
  nowActivities: [
    string,
    string,
  ][];
  lanternCount: number;
  promptPath: string;
  destination: ListingDestination;
  text: (key: string) => string;
};

function navigationPages(pages: PageRecord[]): NavigationPage[] {
  return pages
    .filter((page): boolean => {
      return (
        [
          'home',
          'links-page',
        ].includes(page.type) || page.id === 'now'
      );
    })
    .map((page): NavigationPage => {
      let directory = page.id;

      if (page.id === 'home') {
        directory = '~';
      }

      return {
        ...page,
        directory,
      };
    });
}

function nowLinks(entry: PageRecord, data: PageLoadData): DisplayLinkRecord[] {
  return data.now.sections.map((section): DisplayLinkRecord => {
    return {
      id: `now-${section.id}`,
      title: section.title,
      url: `${entry.url}#now-${section.id}`,
      icon: 'clock',
      language: data.locale,
    };
  });
}

function lanternCount(data: PageLoadData): number {
  if (data.page.id !== 'home') {
    return 1;
  }

  return (
    1 +
    data.pages.filter((page): boolean => {
      return [
        'writing',
        'games',
        'now',
      ].includes(page.id);
    }).length
  );
}

export function pagePresentation(
  data: PageLoadData,
  origin: string = siteOrigin,
): PagePresentation {
  let promptPath = '~';

  if (data.page.id !== 'home') {
    promptPath = `~/${data.page.id}`;
  }

  return {
    navigationPages: navigationPages(data.pages),
    nowPages: data.pages
      .filter((page): boolean => {
        return page.id === 'now';
      })
      .map((entry): UpdatePage => {
        return {
          ...entry,
          nowLinks: nowLinks(entry, data),
        };
      }),
    nowActivities: Object.entries(data.nowActivity)
      .filter((entry): boolean => {
        const [
          key,
          value,
        ] = entry;

        return key !== 'updated' && value.trim().length > 0;
      }),
    lanternCount: lanternCount(data),
    promptPath,
    destination(link): ReturnType<ListingDestination> {
      return destinationFor(
        {
          config: data.config,
          locale: data.locale,
          interfaceName: data.interfaceName,
          origin,
        },
        link,
      );
    },
    text(key): string {
      return requiredText(
        data.localized.ui[key],
        `locales.${data.locale}.ui.${key}`,
      );
    },
  };
}
