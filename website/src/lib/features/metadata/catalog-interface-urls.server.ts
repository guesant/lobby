import type { SearchItem } from '../search/search.types.ts';
import type { InterfaceURLs } from './ai-catalog.types.ts';
import { absoluteURL, isLocalURL } from './catalog-context.server.ts';

export function catalogInterfaceURLs(item: SearchItem): InterfaceURLs {
  if (!isLocalURL(item.url)) {
    return {};
  }

  return {
    voxel: absoluteURL(item.url),
  };
}
