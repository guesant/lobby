import type { SearchItem } from './search.types.ts';

export type SearchableItem = Pick<
  SearchItem,
  'title' | 'summary' | 'tags' | 'metadata'
>;
