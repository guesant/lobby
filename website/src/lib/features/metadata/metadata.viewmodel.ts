import type { PageLoadData } from '../content/content.types.ts';
import { textOr } from '../content/text.model.ts';
import { siteOrigin } from '../navigation/origin.model.ts';
import { jsonScriptContent } from './serialization.model.ts';

type Alternate = {
  id: string;
  href: string;
  hreflang: string;
  ogLocale: string;
};

export type PageMetadata = {
  title: string;
  description: string;
  canonical: string;
  ogImageURL: string;
  robots: 'noindex, follow' | 'index, follow';
  alternates: Alternate[];
  ogAlternates: Alternate[];
  defaultLanguageURL: string;
  structuredData: string;
};

function pageTitle(page: PageLoadData): string {
  if (page.page.id === 'home') {
    return page.localized.seo.title;
  }

  if (page.page.id === 'now') {
    return page.now.seo.title;
  }

  return `${page.page.title} | ${page.config.profile.name}`;
}

function pageDescription(page: PageLoadData): string {
  if (page.page.id === 'home') {
    return page.localized.seo.description;
  }

  if (page.page.id === 'now') {
    return page.now.seo.description;
  }

  return textOr(page.page.description, page.localized.seo.description);
}

function alternateRoutes(page: PageLoadData): Alternate[] {
  return page.languageRoutes
    .filter((route): boolean => {
      return route.available;
    })
    .map((route): Alternate => {
      let path = route.standardURL;

      if (page.interfaceName === 'terminal') {
        path = route.terminalURL;
      }

      return {
        id: route.id,
        href: `${siteOrigin}${path}`,
        hreflang: route.hreflang,
        ogLocale: route.ogLocale,
      };
    });
}

function defaultLanguageURL(page: PageLoadData, routes: Alternate[]): string {
  const route =
    routes.find((entry): boolean => {
      return entry.id === page.config.language_preference.default;
    }) ??
    routes.find((entry): boolean => {
      return entry.id === 'en';
    }) ??
    routes[0];

  return route?.href ?? `${siteOrigin}${page.standardHomeURL}`;
}

function pageIdentity(
  page: PageLoadData,
  canonical: string,
): Record<
  string,
  | string
  | {
    '@id': string;
  }
> {
  if (page.page.id === 'home') {
    return {
      '@type': 'ProfilePage',
      '@id': `${canonical}#profile`,
      mainEntity: {
        '@id': `${siteOrigin}/#person`,
      },
    };
  }

  return {
    '@type': 'WebPage',
    '@id': `${canonical}#page`,
    about: {
      '@id': `${siteOrigin}/#person`,
    },
  };
}

function personGraph(
  page: PageLoadData,
  image: string,
): Record<string, string | string[]> {
  return {
    '@type': 'Person',
    '@id': `${siteOrigin}/#person`,
    name: page.config.profile.name,
    alternateName: `@${page.config.profile.username}`,
    url: siteOrigin,
    image,
    sameAs: page.quickLinks
      .filter((link): boolean => {
        return page.config.profile.same_as_links.includes(link.id);
      })
      .map((link): string => {
        return link.url;
      }),
  };
}

function structuredData(
  page: PageLoadData,
  metadata: Omit<PageMetadata, 'structuredData'>,
): string {
  const website = `${siteOrigin}/${page.locale}/`;

  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      personGraph(page, metadata.ogImageURL),
      {
        '@type': 'WebSite',
        '@id': `${website}#website`,
        url: website,
        name: page.localized.seo.title,
        description: page.localized.seo.description,
        inLanguage: page.localized.ui.html_lang,
        publisher: {
          '@id': `${siteOrigin}/#person`,
        },
      },
      {
        ...pageIdentity(page, metadata.canonical),
        url: metadata.canonical,
        name: metadata.title,
        description: metadata.description,
        inLanguage: page.localized.ui.html_lang,
        isPartOf: {
          '@id': `${website}#website`,
        },
      },
    ],
  };

  return jsonScriptContent(JSON.stringify(graph));
}

export function pageMetadata(page: PageLoadData): PageMetadata {
  const alternates = alternateRoutes(page);

  let robots: PageMetadata['robots'] = 'index, follow';

  if (page.isLanguageEntry) {
    robots = 'noindex, follow';
  }

  const metadata = {
    title: pageTitle(page),
    description: pageDescription(page),
    canonical: `${siteOrigin}${page.page.url}`,
    ogImageURL: `${siteOrigin}/images/og-image.png`,
    robots,
    alternates,
    ogAlternates: alternates.filter((route): boolean => {
      return route.id !== page.locale;
    }),
    defaultLanguageURL: defaultLanguageURL(page, alternates),
  };

  return {
    ...metadata,
    structuredData: structuredData(page, metadata),
  };
}
