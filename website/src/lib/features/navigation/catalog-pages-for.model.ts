import type { SiteData } from '../content/content.types.ts';
import type { RouteContext } from './catalog.types.ts';
import { languagePath } from './language-path.model.ts';
import { presentedPage } from './presented-page.model.ts';
import { pagesFor as configuredPages } from './routes.model.ts';
import type { ConfiguredPage } from './routes.types.ts';

export function pagesFor(
  data: SiteData,
  locale: string,
  interfaceName = 'voxel',
): ReturnType<typeof presentedPage>[] {
  const localePath = languagePath(data, locale);

  const englishPath = languagePath(data, 'en');

  if (!localePath || !englishPath) {
    throw new Error(`Unknown language: ${locale}`);
  }

  const context: RouteContext = {
    localePath,
    englishPath,
    interfaceName,
  };

  const pages: ConfiguredPage[] = configuredPages(data.links, locale);

  const output = [];

  for (const page of pages) {
    const presentation = presentedPage(data, page, context);

    output.push(presentation);
  }

  return output;
}
