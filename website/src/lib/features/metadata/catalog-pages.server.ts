import type { SiteData } from '../content/content.types.ts';
import { pagesFor } from '../navigation/catalog.model.ts';
import type { CatalogPage, InterfaceURLs } from './ai-catalog.types.ts';
import { absoluteURL, interfaceNames } from './catalog-context.server.ts';
import type { InterfaceName } from './resources.server.ts';

function availablePages(
  data: SiteData,
  locale: string,
  interfaceName: InterfaceName,
): ReturnType<typeof pagesFor> {
  return pagesFor(data, locale, interfaceName)
    .filter((page): boolean => {
      return !page.fallback;
    });
}

function pageURLs(
  id: string,
  variants: Map<string, ReturnType<typeof pagesFor>[number]>[],
): InterfaceURLs {
  const urls: InterfaceURLs = {};

  for (const [
    index,
    interfaceName,
  ] of interfaceNames.entries()) {
    const matching = variants[index]?.get(id);

    if (matching) {
      urls[interfaceName] = absoluteURL(matching.url);
    }
  }

  return urls;
}

function localizedPages(data: SiteData, locale: string): CatalogPage[] {
  const variants = interfaceNames.map(
    (interfaceName): Map<string, ReturnType<typeof pagesFor>[number]> => {
      return new Map(
        availablePages(data, locale, interfaceName)
          .map(
            (
              page,
            ): [
              string,
            typeof page,
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

  const first = variants[0];

  if (!first) {
    throw new Error(`Missing page routes: ${locale}`);
  }

  return [
    ...first.values(),
  ].map((page): CatalogPage => {
    return {
      id: page.id,
      title: page.title,
      summary: page.description,
      type: page.type,
      language: locale,
      urls: pageURLs(page.id, variants),
    };
  });
}

export function pageEntries(data: SiteData): CatalogPage[] {
  return data.links.language_options.flatMap((language): CatalogPage[] => {
    return localizedPages(data, language.id);
  });
}
