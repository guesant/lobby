import type { SiteData } from '../content/content.types.ts';

export type MetricPresentationContext = {
  data: SiteData;
  snapshot: SiteData['statistics'][string];
  id: string;
  locale: string;
};
