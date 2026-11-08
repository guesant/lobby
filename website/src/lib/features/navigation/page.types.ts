import type { PageRecord } from '../content/content.types.ts';

export type PageContext = {
  locale: string;
  interfaceName: 'voxel';
  page: PageRecord;
  pages: PageRecord[];
};
