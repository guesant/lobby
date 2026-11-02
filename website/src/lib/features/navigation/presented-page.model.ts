import type { PageRecord, SiteData } from '../content/content.types.ts';
import { optionalProperty } from '../content/object-fields.model.ts';
import type { RouteContext } from './catalog.types.ts';
import { pageSection } from './page-section.model.ts';
import { pageURLs } from './page-urls.model.ts';
import type { ConfiguredPage } from './routes.model.ts';

export function presentedPage(
  data: SiteData,
  page: ConfiguredPage,
  context: RouteContext,
): PageRecord {
  const urls = pageURLs(page, context);

  let url = urls.standard;

  if (context.interfaceName === 'terminal') {
    url = urls.terminal;
  }

  const section = pageSection(data, page.id);

  const optionalSection = optionalProperty('section', section);

  return {
    ...page,
    fallback: page.fallback ?? false,
    description: page.description ?? '',
    standard_url: urls.standard,
    terminal_url: urls.terminal,
    url,
    ...optionalSection,
  };
}
