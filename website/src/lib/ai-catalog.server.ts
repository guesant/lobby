import { searchEntries } from './public-resources.server.ts';
import { pagesFor } from './site-data.server.ts';
import type { SearchItem } from './search.ts';
import type { SiteData } from './site-data.ts';
import type { InterfaceName } from './public-resources.server.ts';
import { siteOrigin } from './site-origin.ts';

type InterfaceURLs = Partial<Record<InterfaceName, string>>;

type CatalogPage = {
  id: string;
  title: string;
  summary: string;
  type: string;
  language: string;
  urls: InterfaceURLs;
};

type CatalogEntry = {
  id: string;
  title: string;
  summary: string;
  type: string;
  source: string;
  language: string;
  tags: string[];
  url: string;
  interface_urls?: InterfaceURLs;
  metadata?: SearchItem['metadata'];
  details_url?: string;
  details_label?: string;
};

type CatalogLanguage = {
  id: string;
  label: string;
  html_lang: string;
  home_urls: InterfaceURLs;
};

export type AICatalog = {
  schema_version: 1;
  name: string;
  url: string;
  description: string;
  languages: CatalogLanguage[];
  interfaces: InterfaceName[];
  pages: CatalogPage[];
  entries: CatalogEntry[];
};

type CatalogCandidate = {
  id: string;
  language: string;
  variants: Array<{
    requestedLocale: string;
    interfaceName: InterfaceName;
    item: SearchItem;
  }>;
};

const interfaceNames: InterfaceName[] = [
  'minecraft',
  'terminal',
];

function absoluteURL(value: string): string {
  return new URL(value, `${siteOrigin}/`).href;
}

function isLocalURL(value: string): boolean {
  return new URL(value, `${siteOrigin}/`).origin === siteOrigin;
}

function pageEntries(data: SiteData): CatalogPage[] {
  return data.links.language_options.flatMap((language): CatalogPage[] => {
    const pages = interfaceNames.map(
      (interfaceName): Map<string, ReturnType<typeof pagesFor>[number]> => {
        return new Map(
          pagesFor(data, language.id, interfaceName)
            .filter((page): boolean => {
              return !page.fallback;
            })
            .map(
              (
                page,
              ): [
                string,
                ReturnType<typeof pagesFor>[number],
              ] => {
                return [
                  page.id,
                  page,
                ];
              },
            ),
        );
      },
    );

    const first = pages[0];

    if (!first) {
      throw new Error(`Missing page routes: ${language.id}`);
    }

    return [
      ...first.values(),
    ].map((page): CatalogPage => {
      const urls: InterfaceURLs = {};

      for (const [
        index,
        interfaceName,
      ] of interfaceNames.entries()) {
        const matching = pages[index]?.get(page.id);

        if (matching) {
          urls[interfaceName] = absoluteURL(matching.url);
        }
      }

      return {
        id: page.id,
        title: page.title,
        summary: page.description,
        type: page.type,
        language: language.id,
        urls,
      };
    });
  });
}

function collectCandidates(data: SiteData): Map<string, CatalogCandidate> {
  const candidates = new Map<string, CatalogCandidate>();

  for (const language of data.links.language_options) {
    const pageIDs = new Set(
      pagesFor(data, language.id)
        .filter((page): boolean => {
          return !page.fallback;
        })
        .map((page): string => {
          return `page-${page.id}`;
        }),
    );

    for (const interfaceName of interfaceNames) {
      for (const item of searchEntries(data, language.id, interfaceName)) {
        if (pageIDs.has(item.id)) {
          continue;
        }

        const key = `${item.id}\u0000${item.language}`;

        let candidate = candidates.get(key);

        if (!candidate) {
          candidate = {
            id: item.id,
            language: item.language,
            variants: [],
          };
          candidates.set(key, candidate);
        }

        candidate.variants.push({
          requestedLocale: language.id,
          interfaceName,
          item,
        });
      }
    }
  }

  return candidates;
}

function preferredVariant(
  variants: CatalogCandidate['variants'],
  interfaceName: InterfaceName,
  language: string,
): CatalogCandidate['variants'][number] | undefined {
  const matching = variants.filter((variant): boolean => {
    return variant.interfaceName === interfaceName;
  });

  return (
    matching.find((variant): boolean => {
      return variant.requestedLocale === language;
    }) || matching[0]
  );
}

function catalogEntry(candidate: CatalogCandidate): CatalogEntry {
  const primary =
    preferredVariant(candidate.variants, 'minecraft', candidate.language) ||
    preferredVariant(candidate.variants, 'terminal', candidate.language);

  if (!primary) {
    throw new Error(`Missing public catalog record: ${candidate.id}`);
  }

  const item = primary.item;

  const entry: CatalogEntry = {
    id: item.id,
    title: item.title,
    summary: item.summary,
    type: item.type,
    source: item.source,
    language: item.language,
    tags: [
      ...item.tags,
    ],
    url: absoluteURL(item.url),
  };

  if (item.metadata && Object.keys(item.metadata).length > 0) {
    entry.metadata = {
      ...item.metadata,
    };
  }

  if (item.details_url) {
    entry.details_url = absoluteURL(item.details_url);
  }

  if (item.details_label) {
    entry.details_label = item.details_label;
  }

  if (isLocalURL(item.url)) {
    const urls: InterfaceURLs = {};

    for (const interfaceName of interfaceNames) {
      const variant = preferredVariant(
        candidate.variants,
        interfaceName,
        candidate.language,
      );

      if (variant && isLocalURL(variant.item.url)) {
        urls[interfaceName] = absoluteURL(variant.item.url);
      }
    }

    if (Object.keys(urls).length > 0) {
      entry.interface_urls = urls;
    }
  }

  return entry;
}

function escapeMarkdownLabel(value: string): string {
  return value
    .replaceAll('\\', '\\\\')
    .replaceAll('[', '\\[')
    .replaceAll(']', '\\]');
}

export function aiCatalog(data: SiteData): AICatalog {
  const languages = data.links.language_options.map(
    (language): CatalogLanguage => {
      const localization = data.links.locales[language.id];

      if (!localization) {
        throw new Error(`Missing AI catalog localization: ${language.id}`);
      }

      return {
        id: language.id,
        label: language.label,
        html_lang: localization.ui.html_lang,
        home_urls: {
          minecraft: absoluteURL(language.path),
          terminal: absoluteURL(`${language.path}terminal/`),
        },
      };
    },
  );

  const description =
    data.links.locales[data.links.language_preference.default]?.seo.description;

  if (!description) {
    throw new Error('Missing default language description');
  }

  const entries = [
    ...collectCandidates(data)
      .values(),
  ].map(catalogEntry);

  const identities = new Set<string>();

  for (const entry of entries) {
    const identity = `${entry.id}\u0000${entry.language}`;

    if (identities.has(identity)) {
      throw new Error(`Duplicate public catalog record: ${entry.id}`);
    }

    identities.add(identity);
  }

  return {
    schema_version: 1,
    name: 'Lobby',
    url: `${siteOrigin}/`,
    description,
    languages,
    interfaces: [
      ...interfaceNames,
    ],
    pages: pageEntries(data),
    entries,
  };
}

export function llmsText(data: SiteData): string {
  const languageLinks = data.links.language_options.map((language): string => {
    const url = absoluteURL(language.path);

    return `- [${escapeMarkdownLabel(language.label)}](${url})`;
  });

  return [
    '# Lobby',
    '',
    `> Site pessoal de ${data.links.profile.name}, com páginas públicas sobre carreira, projetos, escrita, estudos e interesses.`,
    '',
    '## Recursos',
    '',
    `- [Catálogo público para IA](${siteOrigin}/ai-catalog.json)`,
    `- [Sitemap](${siteOrigin}/sitemap.xml)`,
    '',
    '## Páginas iniciais',
    '',
    ...languageLinks,
    '',
  ].join('\n');
}
