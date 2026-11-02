import type { SearchState } from './search.model.ts';
import { readSearchIndex } from './search-index.model.ts';

type SearchDependencies = {
  indexURL: () => string;
  closeDialog: () => void;
  readIndex?: typeof readSearchIndex;
};

export type SearchController = {
  load: () => Promise<void>;
  prepare: () => Promise<void>;
  clearFilters: () => void;
  close: () => void;
  destroy: () => void;
};

class IndexController {
  #pending: AbortController | undefined;

  #loadedURL = '';

  #destroyed = false;

  #state: SearchState;

  #dependencies: SearchDependencies;

  constructor(state: SearchState, dependencies: SearchDependencies) {
    this.#state = state;
    this.#dependencies = dependencies;
  }

  #current(request: AbortController): boolean {
    return !this.#destroyed && this.#pending === request;
  }

  #begin(url: string): AbortController {
    this.#pending?.abort();

    const request = new AbortController();

    this.#pending = request;
    this.#loadedURL = url;
    this.#state.phase = 'loading';

    return request;
  }

  #canLoad(url: string): boolean {
    return (
      !this.#destroyed &&
      (this.#state.phase !== 'loading' || this.#loadedURL !== url)
    );
  }

  async load(): Promise<void> {
    const url = this.#dependencies.indexURL();

    if (!this.#canLoad(url)) {
      return;
    }

    const request = this.#begin(url);

    try {
      const reader = this.#dependencies.readIndex ?? readSearchIndex;

      const entries = await reader(
        url,
        AbortSignal.any([
          request.signal,
          AbortSignal.timeout(10000),
        ]),
      );

      if (this.#current(request)) {
        this.#state.index = entries;
        this.#state.phase = 'ready';
      }
    } catch {
      if (this.#current(request) && !request.signal.aborted) {
        this.#state.phase = 'error';
      }
    }
  }

  clearFilters(): void {
    this.#state.filters = {
      source: '',
      type: '',
      language: '',
    };
  }

  close(): void {
    this.#dependencies.closeDialog();
    this.clearFilters();
    this.#state.query = '';
  }

  destroy(): void {
    this.#destroyed = true;
    this.#pending?.abort();
  }

  async prepare(): Promise<void> {
    if (
      this.#state.phase === 'idle' ||
      this.#loadedURL !== this.#dependencies.indexURL()
    ) {
      await this.load();
    }
  }
}

export function createSearchController(
  state: SearchState,
  dependencies: SearchDependencies,
): SearchController {
  const controller = new IndexController(state, dependencies);

  return {
    load: controller.load.bind(controller),
    prepare: controller.prepare.bind(controller),
    clearFilters: controller.clearFilters.bind(controller),
    close: controller.close.bind(controller),
    destroy: controller.destroy.bind(controller),
  };
}
