import type { SearchItem } from '../search/search.types.ts';
import type { CatalogCandidate, InterfaceURLs } from './ai-catalog.types.ts';
import {
  absoluteURL,
  interfaceNames,
  isLocalURL,
} from './catalog-context.server.ts';
import { preferredCatalogVariant } from './preferred-catalog-variant.server.ts';

export function catalogInterfaceURLs(
  candidate: CatalogCandidate,
  item: SearchItem,
): InterfaceURLs {
  const urls: InterfaceURLs = {};

  if (!isLocalURL(item.url)) {
    return urls;
  }

  for (const interfaceName of interfaceNames) {
    const variant = preferredCatalogVariant(
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
