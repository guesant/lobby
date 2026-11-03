import type { PageRecord } from '../content/content.types.ts';
import type { nowLinks } from './now-links.viewmodel.ts';

export type UpdatePage = PageRecord & {
  nowLinks: ReturnType<typeof nowLinks>;
};
