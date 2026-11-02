import type {
  LinkDestination,
  PageLoadData,
} from '../content/content.types.ts';
import type { SearchFilters, SearchState } from './search.types.ts';

export type FilterChoice = {
  key: keyof SearchFilters;
  label: string;
  options: {
    value: string;
    label: string;
  }[];
};

export type SearchResult = {
  id: string;
  title: string;
  action: LinkDestination;
  origin: string;
  details?: LinkDestination;
  detailsTitle: string;
};

export type ResultGroup = {
  title: string;
  entries: SearchResult[];
};

export type SearchViewModel = {
  state: SearchState;
  labels: PageLoadData['editorialUI'];
  filters: FilterChoice[];
  groups: ResultGroup[];
  status: string;
};
