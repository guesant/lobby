import { optionalProperty } from './object-fields.ts';
import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { parse } from 'yaml';
import * as configuration from './configuration.ts';
import { validateSiteDocuments } from './data-validation.ts';
import {
  federationStatuses,
  type FederationStatus,
} from './federation-status.ts';
import type {
  DisplayLinkRecord,
  LinkRecord,
  PageRecord,
  SectionRecord,
  SiteData,
} from './site-data.ts';

const siteCache = new Map<
  string,
  {
    signature: string;
    data: SiteData;
  }
>();

async function inputSignature(root: string): Promise<string> {
  const files = [
    'src/data/links.yaml',
    'src/data/editorial.yaml',
    'src/data/credits.yaml',
    'src/data/statistics.yaml',
    '../.cache/federation/assets/federation.json',
  ];

  const versions = await Promise.all(
    files.map(async (file): Promise<string> => {
      try {
        const metadata = await stat(resolve(root, file), {
          bigint: true,
        });

        return `${file}:${metadata.size}:${metadata.mtimeNs}`;
      } catch (error) {
        if (
          file.endsWith('federation.json') &&
          error instanceof Error &&
          'code' in error &&
          error.code === 'ENOENT'
        ) {
          return `${file}:missing`;
        }

        throw error;
      }
    }),
  );

  return versions.join('|');
}

export async function getFederationStatus(
  websiteRoot: string = process.cwd(),
): Promise<FederationStatus[]> {
  try {
    const value: unknown = JSON.parse(
      await readFile(
        resolve(websiteRoot, '../.cache/federation/assets/status.json'),
        'utf8',
      ),
    );

    return federationStatuses(value);
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return [];
    }

    throw error;
  }
}

export async function getSiteData(
  websiteRoot: string = process.cwd(),
): Promise<SiteData> {
  websiteRoot = resolve(websiteRoot);

  const signature = await inputSignature(websiteRoot);

  const cached = siteCache.get(websiteRoot);

  if (cached?.signature === signature) {
    return cached.data;
  }

  const readYaml = async (name: string): Promise<unknown> => {
    return parse(
      await readFile(resolve(websiteRoot, `src/data/${name}.yaml`), 'utf8'),
    ) as unknown;
  };

  const [
    links,
    editorial,
    credits,
    statistics,
  ] = await Promise.all(
    [
      'links',
      'editorial',
      'credits',
      'statistics',
    ].map(readYaml),
  );

  let federation: unknown = {
    version: 1,
    items: [],
  };

  try {
    federation = JSON.parse(
      await readFile(
        resolve(websiteRoot, '../.cache/federation/assets/federation.json'),
        'utf8',
      ),
    ) as unknown;
  } catch (error) {
    if (
      !(error instanceof Error) ||
      !('code' in error) ||
      error.code !== 'ENOENT'
    ) {
      throw error;
    }
  }

  const data = validateSiteDocuments({
    links,
    editorial,
    credits,
    statistics,
    federation,
  });

  siteCache.set(websiteRoot, {
    signature,
    data,
  });

  return data;
}

export function pagesFor(
  data: SiteData,
  locale: string,
  interfaceName = 'minecraft',
): PageRecord[] {
  const language = data.links.language_options.find((item): boolean => {
    return item.id === locale;
  });

  const english = data.links.language_options.find((item): boolean => {
    return item.id === 'en';
  });

  if (!language || !english) {
    throw new Error(`Unknown language: ${locale}`);
  }

  return configuration.pagesFor(data.links, locale)
    .map(
      (
        page,
      ): {
        section?: SectionRecord;
        fallback: boolean;
        description: string;
        standard_url: string;
        terminal_url: string;
        url: string;
        id: string;
        type: string;
        title: string;
        icon: string;
        links?: LinkRecord[];
      } => {
        const fallbackNow = page.id === 'now' && page.fallback;

        const resolveStandardURL = (): string => {
          if (fallbackNow) {
            return `${english.path}now/`;
          }

          return page.url;
        };

        const standardURL = resolveStandardURL();

        let terminalURL = `${language.path}terminal/`;

        if (page.id !== 'home' && !page.fallback) {
          terminalURL = `${language.path}terminal/${page.id}/`;
        }

        if (fallbackNow) {
          terminalURL = `${english.path}terminal/now/`;
        }

        const section = data.links.sections.find((candidate): boolean => {
          return candidate.id === page.id;
        });

        const resolveUrl = (): string => {
          if (interfaceName === 'terminal') {
            return terminalURL;
          }

          return standardURL;
        };

        return {
          ...page,
          fallback: page.fallback || false,
          description: page.description || '',
          standard_url: standardURL,
          terminal_url: terminalURL,
          url: resolveUrl(),
          ...optionalProperty('section', section),
        };
      },
    );
}

export function routeEntries(data: SiteData): string[] {
  return data.links.language_options.flatMap(({
    id
  }): string[] => {
    return [
      'minecraft',
      'terminal',
    ].flatMap((interfaceName): string[] => {
      return pagesFor(data, id, interfaceName)
        .filter((page): boolean => {
          return !page.fallback;
        })
        .map((page): string => {
          return page.url.slice(1, -1);
        });
    });
  });
}

export function sectionLinks(
  data: SiteData,
  section: SectionRecord,
  locale: string,
): DisplayLinkRecord[] {
  return configuration
    .linksForSection(data.links, section)
    .map((item): DisplayLinkRecord => {
      return displayLink(data, item, locale);
    });
}

type ConfiguredLink = ReturnType<typeof configuration.linksForSection>[number];

function localizedVisual(
  visual: ConfiguredLink['visual'],
  locale: string,
): DisplayLinkRecord['visual'] {
  if (!visual) {
    return undefined;
  }

  return {
    ...visual,
    alt: visual.alt[locale] || visual.alt.en || '',
  };
}

function linkStatistics(
  data: SiteData,
  item: ConfiguredLink,
  locale: string,
): DisplayLinkRecord['statistics'] {
  if (!item.stats) {
    return undefined;
  }

  const snapshot = data.statistics[item.id];

  if (
    !snapshot ||
    snapshot.profile_url !== item.url ||
    snapshot.provider !== item.stats.provider
  ) {
    return {
      unavailable:
        data.links.statistics.unavailable[locale] ||
        data.links.statistics.unavailable.en ||
        '',
    };
  }

  return {
    updatedLabel:
      data.links.statistics.updated[locale] ||
      data.links.statistics.updated.en ||
      '',
    updatedAt: new Date(snapshot.updated_at)
      .toISOString()
      .slice(0, 10),
    metrics: item.stats.metrics.map(
      (
        id,
      ): {
        total?: number;
        id: string;
        label: string;
        icon: string;
        value: string;
      } => {
        const metric = data.links.statistics.metrics[id];

        if (!metric) {
          throw new Error(`Unknown metric: ${id}`);
        }

        return {
          id,
          label: metric.labels[locale] || metric.labels.en || id,
          icon: metric.icon,
          value: String(snapshot.metrics[id]),
          ...optionalProperty('total', snapshot.available?.[id]),
        };
      },
    ),
  };
}

function displayLink(
  data: SiteData,
  item: ConfiguredLink,
  locale: string,
): DisplayLinkRecord {
  const {
    visual,
    ...baseItem
  } = item;

  const labels = item.labels[locale] || item.labels.en;

  if (!labels) {
    throw new Error(`Missing link labels: ${item.id}`);
  }

  const url =
    item.localized_urls?.[locale] ||
    item.localized_urls?.en ||
    item.url ||
    Object.values(item.localized_urls || {})[0];

  if (!url) {
    throw new Error(`Missing link destination: ${item.id}`);
  }

  const statistics = linkStatistics(data, item, locale);

  const displayVisual = localizedVisual(visual, locale);

  return {
    ...baseItem,
    title: labels.title,
    url,
    language: locale,
    ...optionalProperty('description', labels.description),
    ...optionalProperty('badge', labels.badge),
    ...optionalProperty('visual', displayVisual),
    ...optionalProperty('statistics', statistics),
  };
}
