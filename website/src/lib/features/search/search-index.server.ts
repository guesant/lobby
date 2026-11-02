import type {
  DisplayLinkRecord,
  EditorialRecord,
  PageRecord,
  SiteData,
} from '../content/content.types.ts';
import { editorialItems } from '../content/editorial.model.ts';
import { textOr } from '../content/text.model.ts';
import { sectionLinks } from '../listings/links.model.ts';
import type { InterfaceName } from '../metadata/resources.server.ts';
import { pagesFor } from '../navigation/catalog.model.ts';
import type { SearchItem } from './search.model.ts';

type SearchContext = {
  data: SiteData;
  locale: string;
  interfaceName: InterfaceName;
  ui: Record<string, string>;
};

function indexLink(
  item: DisplayLinkRecord,
  page: PageRecord,
  context: SearchContext,
): SearchItem {
  return {
    id: `${page.id}-${item.id}`,
    title: item.title,
    summary: item.description ?? '',
    url: item.url,
    type: 'link',
    group: textOr(textOr(context.ui[page.id], context.ui['page']), page.title),
    source: 'lobby',
    language: context.locale,
    tags: [],
  };
}

function indexEditorial(
  item: EditorialRecord,
  page: PageRecord,
  ui: Record<string, string>,
): SearchItem {
  return {
    id: `${page.id}-${item.source}-${item.id}`,
    title: item.title,
    summary: item.summary,
    url: textOr(item.url, `${page.url}#page-${page.id}-${item.id}`),
    details_url: item.details_url ?? '',
    details_label: item.details_label ?? '',
    type: item.type,
    group: textOr(textOr(ui[item.type], ui[page.id]), page.title),
    source: item.source,
    language: item.language,
    tags: item.tags,
    metadata: item.metadata,
  };
}

function indexPage(page: PageRecord, context: SearchContext): SearchItem[] {
  const {
    data,
    locale,
    ui
  } = context;

  const entry: SearchItem = {
    id: `page-${page.id}`,
    title: page.title,
    summary: page.description,
    url: page.url,
    type: 'page',
    group: textOr(ui['page'], page.title),
    source: 'lobby',
    language: locale,
    tags: [],
  };

  if (page.type !== 'links-page') {
    return [
      entry,
    ];
  }

  if (!page.section) {
    throw new Error(`Missing section: ${page.id}`);
  }

  return [
    entry,
    ...sectionLinks(data, page.section, locale)
      .map((item): SearchItem => {
        return indexLink(item, page, context);
      }),
    ...editorialItems(data, page.id, locale)
      .map((item): SearchItem => {
        return indexEditorial(item, page, ui);
      }),
  ];
}

function indexPersonalUpdate(context: SearchContext): SearchItem[] {
  const {
    data,
    locale,
    interfaceName,
    ui
  } = context;

  const nowPage = pagesFor(data, locale, interfaceName)
    .find(
      (page): boolean => {
        return page.id === 'now';
      },
    );

  const now = data.links.now[locale] ?? data.links.now['en'];

  if (!now || !nowPage) {
    throw new Error(`Missing personal update: ${locale}`);
  }

  let language = 'en';

  if (data.links.now[locale]) {
    language = locale;
  }

  return now.sections.map((section): SearchItem => {
    return {
      id: `now-${section.id}`,
      title: section.title,
      summary: section.description,
      url: `${nowPage.url}#now-${section.id}`,
      type: 'page',
      group: textOr(ui['page'], nowPage.title),
      source: 'lobby',
      language,
      tags: [],
    };
  });
}

function indexActivity(context: SearchContext): SearchItem[] {
  const {
    data,
    locale,
    interfaceName,
    ui
  } = context;

  const pages = pagesFor(data, locale, interfaceName);

  let destination = pages.find((page): boolean => {
    return page.id === 'home';
  });

  if (data.editorial.now[locale]) {
    destination = pages.find((page): boolean => {
      return page.id === 'now';
    });
  }

  if (!destination) {
    throw new Error('Missing activity destination');
  }

  const activity = data.editorial.now[locale] ?? {};

  const page = destination;

  return [
    'working',
    'building',
    'studying',
    'reading',
    'listening',
    'watching',
  ].flatMap((key): SearchItem[] => {
    const summary = activity[key];

    if (!summary) {
      return [];
    }

    return [
      {
        id: `now-activity-${key}`,
        title: textOr(ui[key], key),
        summary,
        url: `${page.url}#now-activity-${key}`,
        type: 'page',
        group: textOr(ui['page'], page.title),
        source: 'lobby',
        language: locale,
        tags: [],
      },
    ];
  });
}

export function searchEntries(
  data: SiteData,
  locale: string,
  interfaceName: InterfaceName,
): SearchItem[] {
  const ui = data.editorial.ui[locale];

  if (!ui) {
    throw new Error(`Missing search labels: ${locale}`);
  }

  const context: SearchContext = {
    data,
    locale,
    interfaceName,
    ui,
  };

  const pages = pagesFor(data, locale, interfaceName)
    .filter(
      (page): boolean => {
        return !page.fallback;
      },
    );

  return [
    ...pages.flatMap((page): SearchItem[] => {
      return indexPage(page, context);
    }),
    ...indexPersonalUpdate(context),
    ...indexActivity(context),
  ];
}
