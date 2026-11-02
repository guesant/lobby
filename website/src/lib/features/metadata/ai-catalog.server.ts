import type { SiteData } from '../content/content.types.ts';
import { pagesFor } from '../navigation/catalog.model.ts';
import { siteOrigin } from '../navigation/origin.model.ts';
import type { SearchItem } from '../search/search.model.ts';
import { searchEntries } from '../search/search-index.server.ts';
import type {
  AICatalog,
  CatalogCandidate,
  CatalogEntry,
  CatalogLanguage,
  InterfaceURLs,
} from './ai-catalog.types.ts';
import {
  absoluteURL,
  interfaceNames,
  isLocalURL,
} from './catalog-context.server.ts';
import { pageEntries } from './catalog-pages.server.ts';
import type { InterfaceName } from './resources.server.ts';

function collectLocale(
  data: SiteData,
  locale: string,
  candidates: Map<string, CatalogCandidate>,
): void {
  const pageIDs = new Set(
    pagesFor(data, locale)
      .filter((page): boolean => {
        return !page.fallback;
      })
      .map((page): string => {
        return `page-${page.id}`;
      }),
  );

  for (const interfaceName of interfaceNames) {
    for (const item of searchEntries(data, locale, interfaceName)) {
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
        requestedLocale: locale,
        interfaceName,
        item,
      });
    }
  }
}

function collectCandidates(data: SiteData): Map<string, CatalogCandidate> {
  const candidates = new Map<string, CatalogCandidate>();

  for (const language of data.links.language_options) {
    collectLocale(data, language.id, candidates);
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
    }) ?? matching[0]
  );
}

function catalogRecord(candidate: CatalogCandidate): SearchItem {
  const primary =
    preferredVariant(candidate.variants, 'minecraft', candidate.language) ??
    preferredVariant(candidate.variants, 'terminal', candidate.language);

  if (!primary) {
    throw new Error(`Missing public catalog record: ${candidate.id}`);
  }

  return primary.item;
}

function catalogEntry(candidate: CatalogCandidate): CatalogEntry {
  const item = catalogRecord(candidate);

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

  const urls = catalogInterfaceURLs(candidate, item);

  if (Object.keys(urls).length > 0) {
    entry.interface_urls = urls;
  }

  return entry;
}

function catalogInterfaceURLs(
  candidate: CatalogCandidate,
  item: SearchItem,
): InterfaceURLs {
  const urls: InterfaceURLs = {};

  if (!isLocalURL(item.url)) {
    return urls;
  }

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

  return urls;
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
