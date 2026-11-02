import type { SiteData } from './content.types.ts';
import { validateSiteDocuments } from './documents.validation.ts';
import { readFederation } from './read-federation.server.ts';
import { readYaml } from './read-yaml.server.ts';

export async function readDocuments(root: string): Promise<SiteData> {
  const linksPromise = readYaml(root, 'links');

  const editorialPromise = readYaml(root, 'editorial');

  const creditsPromise = readYaml(root, 'credits');

  const statisticsPromise = readYaml(root, 'statistics');

  const [
    links,
    editorial,
    credits,
    statistics,
  ] = await Promise.all([
    linksPromise,
    editorialPromise,
    creditsPromise,
    statisticsPromise,
  ]);

  const federation = await readFederation(root);

  return validateSiteDocuments({
    links,
    editorial,
    credits,
    statistics,
    federation,
  });
}
