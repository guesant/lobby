import type { pagesFor } from '../navigation/catalog.model.ts';
import { absoluteURL } from './absolute-url.server.ts';
import type { InterfaceURLs } from './ai-catalog.types.ts';
import { interfaceNames } from './catalog-context.server.ts';

export function catalogPageURLs(
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
