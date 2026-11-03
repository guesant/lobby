import type { SiteData } from '../content/content.types.ts';

export type BuildLabelContext = {
  locale: string;
  localized: SiteData['links']['locales'][string]['ui'];
  runID: string;
  runNumber: string;
};
