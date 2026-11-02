export type SearchItem = {
  id: string;
  title: string;
  summary: string;
  url: string;
  group: string;
  source: string;
  language: string;
  type: string;
  tags: string[];
  metadata?: Record<string, string | number | boolean | string[]>;
  details_url?: string;
  details_label?: string;
};

export type SearchFilters = {
  source: string;
  type: string;
  language: string;
};

export type SearchState = {
  phase: 'idle' | 'loading' | 'ready' | 'error';
  index: SearchItem[];
  query: string;
  filters: SearchFilters;
};
