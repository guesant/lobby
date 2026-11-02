import type { LinkDocument, LinkRecord } from '../content/content.types.ts';
import { linkedPage } from './linked-page.model.ts';
import type { ConfiguredPage } from './routes.types.ts';
import { visibleLinks } from './visible-links.model.ts';

export function linkedPages(
  configuration: LinkDocument,
  language: string,
): ConfiguredPage[] {
  const links = visibleLinks(configuration);

  const pages: ConfiguredPage[] = [];

  for (const id of configuration.navigation.links) {
    let entry: LinkRecord | undefined;

    for (const candidate of links) {
      if (candidate.id === id) {
        entry = candidate;
        break;
      }
    }

    if (!entry) {
      continue;
    }

    const fallback = !configuration.now[language];

    const page = linkedPage(entry, language, fallback);

    pages.push(page);
  }

  return pages;
}
