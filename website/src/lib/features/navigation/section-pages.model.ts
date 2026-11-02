import type { LinkDocument } from '../content/content.types.ts';
import { configuredSectionPage } from './configured-section-page.model.ts';
import type { ConfiguredPage } from './routes.types.ts';

export function sectionPages(
  configuration: LinkDocument,
  language: string,
  path: string,
): ConfiguredPage[] {
  const pages: ConfiguredPage[] = [];

  for (const id of configuration.navigation.sections) {
    const page = configuredSectionPage({
      configuration,
      language,
      path,
      id,
    });

    if (page) {
      pages.push(page);
    }
  }

  return pages;
}
