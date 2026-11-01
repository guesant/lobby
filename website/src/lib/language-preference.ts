import type { PageLoadData } from './site-data.ts';

export type LanguagePageData = Pick<
  PageLoadData,
  'config' | 'interfaceName' | 'isLanguageEntry' | 'locale' | 'languageRoutes'
>;

export type LanguageRoute = {
  id: string;
  home: string;
  url: string;
};

export type LanguageContext = {
  routes: LanguageRoute[];
  default: string;
  current: string;
  neutral: boolean;
};

export function languageContext(data: LanguagePageData): LanguageContext {
  const terminal = data.interfaceName === 'terminal';

  const resolveCurrent = (): string => {
    if (data.isLanguageEntry) {
      return '';
    }

    return data.locale;
  };

  return {
    default: data.config.language_preference.default,
    current: resolveCurrent(),
    neutral: data.isLanguageEntry,
    routes: data.languageRoutes.map(
      (
        route,
      ): {
        id: string;
        home: string;
        url: string;
      } => {
        const resolveHome = (): '' | 'terminal/' => {
          if (terminal) {
            return 'terminal/';
          }

          return '';
        };

        const resolveUrl = (): string => {
          if (!route.available) {
            return '';
          }

          if (terminal) {
            return route.terminalURL;
          }

          return route.standardURL;
        };

        return {
          id: route.id,
          home: `${route.path}${resolveHome()}`,
          url: resolveUrl(),
        };
      },
    ),
  };
}

export function languageFor(
  context: LanguageContext,
  id: string | null,
): LanguageRoute | undefined {
  return context.routes.find((route): boolean => {
    return route.id === id;
  });
}

function browserLanguage(
  context: LanguageContext,
  languages: readonly string[],
): LanguageRoute | undefined {
  for (const tag of languages) {
    const normalized = tag.toLowerCase()
      .replaceAll('_', '-');

    const match =
      languageFor(context, normalized) ||
      context.routes.find((route): boolean => {
        return route.id.split('-')[0] === normalized.split('-')[0];
      });

    if (match) {
      return match;
    }
  }

  return languageFor(context, context.default);
}

export function selectedLanguage(
  context: LanguageContext,
  source: URL,
  saved: string | null,
  languages: readonly string[],
): LanguageRoute | undefined {
  const explicit = languageFor(context, source.searchParams.get('lang'));

  if (explicit) {
    return explicit;
  }

  const preference = languageFor(context, saved);

  if (preference) {
    return preference;
  }

  if (!context.neutral) {
    return undefined;
  }

  return browserLanguage(context, languages);
}

export function languageDestination(
  route: LanguageRoute,
  source: URL,
  manual: boolean = false,
): URL | null {
  const resolvePath = (): string => {
    if (manual) {
      return route.home;
    }

    return '';
  };

  const path = route.url || resolvePath();

  if (!path.startsWith('/') || path.startsWith('//')) {
    return null;
  }

  const target = new URL(path, source);

  if (target.origin !== source.origin) {
    return null;
  }

  target.search = source.search;

  const resolveHash = (): string => {
    if (route.url) {
      return source.hash;
    }

    return '';
  };

  target.hash = resolveHash();

  return target;
}
