import type { SiteData } from '../content/content.types.ts';
import { pagesFor } from '../navigation/catalog.model.ts';
import type { DocumentContext } from './document-presentation.types.ts';

export function documentPageID(
  data: SiteData,
  context: DocumentContext,
): string | undefined {
  const privacyPath = `/${context.language}/privacy`;

  if (context.pathname === privacyPath) {
    return 'privacy';
  }

  for (const page of pagesFor(data, context.language)) {
    if (page.url.replace(/\/+$/, '') === context.pathname) {
      return page.id;
    }
  }

  return undefined;
}
