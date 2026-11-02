import type { SearchState } from './search.types.ts';
import type { readSearchIndex } from './search-index.model.ts';

export type SearchDependencies = {
  indexURL: () => string;
  closeDialog: () => void;
  readIndex?: typeof readSearchIndex;
};

export type SearchControllerState = {
  pending: AbortController | undefined;
  loadedURL: string;
  destroyed: boolean;
  state: SearchState;
  dependencies: SearchDependencies;
};

export type SearchController = {
  load: () => Promise<void>;
  prepare: () => Promise<void>;
  clearFilters: () => void;
  close: () => void;
  destroy: () => void;
};
