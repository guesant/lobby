import type { PageRecord } from '../content/content.types.ts';

export type NavigationPage = PageRecord & {
  directory: string;
};
