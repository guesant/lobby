import type { SiteData } from '../content/content.types.ts';
import { pagesFor } from '../navigation/catalog.model.ts';
import type { DocumentContext } from './document-presentation.types.ts';

export function documentPageID(
  data: SiteData,
  context: DocumentContext,
): string | undefined {
  const privacyPath = `/${context.language}/privacy`;

  const terminalPrivacyPath = `/${context.language}/terminal/privacy`;

  if (
    context.pathname === privacyPath ||
    context.pathname === terminalPrivacyPath
  ) {
    return 'privacy';
  }

  for (const page of pagesFor(data, context.language, context.interfaceName)) {
    if (page.url.replace(/\/+$/, '') === context.pathname) {
      return page.id;
    }
  }

  return undefined;
}
