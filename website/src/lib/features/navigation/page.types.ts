import type { PageRecord } from '../content/content.types.ts';

export type PageContext = {
  locale: string;
  interfaceName: 'voxel' | 'terminal';
  page: PageRecord;
  pages: PageRecord[];
  standardPages: PageRecord[];
  terminalPages: PageRecord[];
};
