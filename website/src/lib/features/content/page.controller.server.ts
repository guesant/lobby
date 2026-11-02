import { buildMetadata } from '../metadata/build.server.ts';
import { resolvePageContext } from '../navigation/page.model.ts';
import { getFederationStatus, getSiteData } from './content.server.ts';
import type { PageLoadData } from './content.types.ts';
import { pageContent } from './page.model.ts';

export async function loadPageData(
  path: string,
  isLanguageEntry = false,
  websiteRoot: string = process.cwd(),
): Promise<PageLoadData | undefined> {
  const data = await getSiteData(websiteRoot);

  const context = resolvePageContext(data, path);

  if (!context) {
    return undefined;
  }

  const content = pageContent(data, context);

  return {
    ...content,
    isLanguageEntry,
    federationStatus: await getFederationStatus(websiteRoot),
    build: buildMetadata(data, content.localized, context.locale),
  };
}
