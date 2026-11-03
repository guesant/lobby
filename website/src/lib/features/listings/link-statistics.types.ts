import type { SiteData } from '../content/content.types.ts';
import type { ConfiguredLink } from './links.types.ts';

export type LinkStatisticsContext = {
  data: SiteData;
  item: ConfiguredLink;
  locale: string;
};
