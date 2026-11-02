import type { LinkRecord } from '../content/content.types.ts';

export type Publication = Pick<
  LinkRecord,
  'enabled' | 'public' | 'private' | 'draft'
>;

export type ConfiguredPage = {
  id: string;
  type: string;
  title: string;
  description?: string;
  url: string;
  icon: string;
  fallback?: boolean;
  links?: LinkRecord[];
};
