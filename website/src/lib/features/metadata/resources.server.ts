import { getSiteData } from '../content/content.server.ts';
import type { SiteData } from '../content/content.types.ts';
import { routeEntries } from '../navigation/catalog.model.ts';
import { siteOrigin } from '../navigation/origin.model.ts';
import { error, type RequestHandler } from '@sveltejs/kit';
import { encodeXML } from 'entities';

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
  contentType = 'application/json',
): RequestHandler<{
  index: string;
}> {
  return async (input): Promise<Response> => {
    const {
      params
    } = input;

    const {
      data,
      locale,
      interfaceName
    } = await loadResource(params.index);

    return Response.json(present(data, locale, interfaceName), {
      headers: {
        'content-type': contentType,
      },
    });
  };
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
