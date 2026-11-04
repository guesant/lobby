import type { SiteData } from '../content/content.types.ts';
import type { ResourceIdentity } from './resource.types.ts';

export function resourceIdentity(
  data: SiteData,
  index: string,
): ResourceIdentity | undefined {
  const match = /^(.*)-(voxel|terminal)$/.exec(index);

  const locale = match?.[1];

  const interfaceName = match?.[2];

  if (!locale || (interfaceName !== 'voxel' && interfaceName !== 'terminal')) {
    return undefined;
  }

  for (const entry of data.links.language_options) {
    if (entry.id === locale) {
      return {
        locale,
        interfaceName: interfaceName,
      };
    }
  }

  return undefined;
}
