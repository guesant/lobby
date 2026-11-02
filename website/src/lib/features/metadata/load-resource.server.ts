import { getSiteData } from '../content/content.server.ts';
import type { SiteData } from '../content/content.types.ts';
import type { InterfaceName } from './resource.types.ts';
import { resourceIdentity } from './resource-identity.server.ts';
import { error } from '@sveltejs/kit';

export async function loadResource(index: string): Promise<{
  data: SiteData;
  locale: string;
  interfaceName: InterfaceName;
}> {
  const data = await getSiteData();

  const identity = resourceIdentity(data, index);

  if (!identity) {
    error(404, 'Unknown localized resource');
  }

  return {
    data,
    ...identity,
  };
}
