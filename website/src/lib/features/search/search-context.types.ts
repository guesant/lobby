import type { SiteData } from '../content/content.types.ts';
import type { InterfaceName } from '../metadata/resource.types.ts';

export type SearchContext = {
  data: SiteData;
  locale: string;
  interfaceName: InterfaceName;
  ui: Record<string, string>;
};
