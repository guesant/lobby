import type { PageRecord, SiteData } from '../content/content.types.ts';
import { optionalProperty } from '../content/object-fields.model.ts';
import type { RouteContext } from './catalog.types.ts';
import { pageSection } from './page-section.model.ts';
import { pageURL } from './page-url.model.ts';
import type { ConfiguredPage } from './routes.types.ts';

export function presentedPage(
  data: SiteData,
  page: ConfiguredPage,
  context: RouteContext,
): PageRecord {
  const url = pageURL(page, context);

  const section = pageSection(data, page.id);

  const optionalSection = optionalProperty('section', section);

  return {
    ...page,
    fallback: page.fallback ?? false,
    description: page.description ?? '',
    url,
    ...optionalSection,
  };
}
