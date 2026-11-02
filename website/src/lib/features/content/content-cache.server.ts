import type { SiteData } from './content.types.ts';

export const siteCache = new Map<
  string,
  {
    signature: string;
    data: SiteData;
  }
>();
