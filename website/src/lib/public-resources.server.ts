import { editorialItems } from './editorial-items.ts';
import { pagesFor, sectionLinks, routeEntries } from './site-data.server.ts';
import type {
  PageRecord,
  SiteData,
  DisplayLinkRecord,
  EditorialRecord,
} from './site-data.ts';
import { siteOrigin } from './site-origin.ts';
import type { SearchItem } from './search.ts';
import { encodeXML } from 'entities';
import { error, json, type RequestHandler } from '@sveltejs/kit';
import { getSiteData } from './site-data.server.ts';

async function loadResource(index: string): Promise<{
  data: SiteData;
  locale: string;
  interfaceName: InterfaceName;
}> {
  const data = await getSiteData();

  const identity = resourceIdentity(data, index);

  if (!identity) {
    error(404, 'Unknown localized resource');
  }

  return {
    data,
    ...identity,
  };
}

export async function localizedResourceEntries(): Promise<
  ReturnType<typeof resourceEntries>
> {
  return resourceEntries(await getSiteData());
}

export type InterfaceName = 'minecraft' | 'terminal';

type ResourcePresenter = (
  data: SiteData,
  locale: string,
  interfaceName: InterfaceName,
) => unknown;

export function resourceRequest(
  present: ResourcePresenter,
  contentType: string = 'application/json',
): RequestHandler<{
  index: string;
}> {
  return async ({
    params
  }): Promise<Response> => {
    const {
      data,
      locale,
      interfaceName
    } = await loadResource(params.index);

    return json(present(data, locale, interfaceName), {
      headers: {
        'content-type': contentType,
      },
    });
  };
}

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
    summary: item.description || '',
    url: item.url,
    type: 'link',
    group: context.ui[page.id] || context.ui.page || page.title,
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
    summary: item.summary || '',
    url: item.url || `${page.url}#page-${page.id}-${item.id}`,
    details_url: item.details_url || '',
    details_label: item.details_label || '',
    type: item.type,
    group: ui[item.type] || ui[page.id] || page.title,
    source: item.source,
    language: item.language,
    tags: item.tags || [],
    metadata: item.metadata || {},
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
    summary: page.description || '',
    url: page.url,
    type: 'page',
    group: ui.page || page.title,
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

  const now = data.links.now[locale] || data.links.now.en;

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
      summary: section.description || '',
      url: `${nowPage.url}#now-${section.id}`,
      type: 'page',
      group: ui.page || nowPage.title,
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

  const activity = data.editorial.now[locale] || {};

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
        title: ui[key] || key,
        summary,
        url: `${page.url}#now-activity-${key}`,
        type: 'page',
        group: ui.page || page.title,
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

export function resourceEntries(data: SiteData): {
  index: string;
}[] {
  return data.links.language_options.flatMap(
    (
      language,
    ): {
      index: string;
    }[] => {
      return [
        {
          index: language.id + '-minecraft',
        },
        {
          index: language.id + '-terminal',
        },
      ];
    },
  );
}

function resourceIdentity(
  data: SiteData,
  index: string,
):
  | {
    locale: string;
    interfaceName: InterfaceName;
  }
  | undefined {
  const match = /^(.*)-(minecraft|terminal)$/.exec(index);

  const locale = match?.[1];

  const interfaceName = match?.[2];

  if (
    !locale ||
    (interfaceName !== 'minecraft' && interfaceName !== 'terminal') ||
    !data.links.language_options.some((entry): boolean => {
      return entry.id === locale;
    })
  ) {
    return undefined;
  }

  return {
    locale,
    interfaceName,
  };
}

type WebManifest = {
  name: string;
  short_name: string;
  description: string;
  start_url: string;
  scope: string;
  display: string;
  background_color: string;
  theme_color: string;
  lang: string | undefined;
  icons: {
    src: string;
    sizes: string;
    type: string;
    purpose: string;
  }[];
};

export function webManifest(
  data: SiteData,
  locale: string,
  interfaceName: InterfaceName,
): WebManifest {
  const localized = data.links.locales[locale];

  if (!localized) {
    throw new Error('Missing manifest locale');
  }

  let start = '/' + locale + '/';

  if (interfaceName === 'terminal') {
    start += 'terminal/';
  }

  return {
    name: localized.seo.title,
    short_name: 'Lobby',
    description: localized.seo.description,
    start_url: start,
    scope: '/',
    display: 'standalone',
    background_color: '#1b1b18',
    theme_color: '#38651f',
    lang: localized.ui.html_lang,
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
  };
}

export function sitemap(data: SiteData, locale?: string): string {
  const urls = [
    ...new Set(routeEntries(data)),
  ]
    .filter((path): boolean => {
      return !locale || path.startsWith(locale + '/') || path === locale;
    })
    .map((path): string => {
      return (
        '<url><loc>' +
        encodeXML(new URL('/' + path + '/', siteOrigin).href) +
        '</loc></url>'
      );
    });

  return (
    '<?xml version="1.0" encoding="utf-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
    urls.join('') +
    '</urlset>'
  );
}
