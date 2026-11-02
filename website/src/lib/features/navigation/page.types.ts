import type { PageRecord } from '../content/content.types.ts';

export type PageContext = {
  locale: string;
  interfaceName: 'minecraft' | 'terminal';
  page: PageRecord;
  pages: PageRecord[];
  standardPages: PageRecord[];
  terminalPages: PageRecord[];
};
