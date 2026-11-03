import type { PageLoadData } from './content.types.ts';

export type PageContent = Omit<
  PageLoadData,
  'isLanguageEntry' | 'federationStatus' | 'build'
>;
