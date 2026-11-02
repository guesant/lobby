import { resolveDestination } from '../content/content.model.ts';
import type {
  LinkDestination,
  PageLoadData,
} from '../content/content.types.ts';
import { textOr } from '../content/text.model.ts';
import type { SearchFilters, SearchItem, SearchState } from './search.model.ts';
import {
  filterSearchItems,
  initialSearchState,
  searchItems,
} from './search.model.ts';

type FilterChoice = {
  key: keyof SearchFilters;
  label: string;
  options: {
    value: string;
    label: string;
  }[];
};

type SearchResult = {
  id: string;
  title: string;
  action: LinkDestination;
  origin: string;
  details?: LinkDestination;
  detailsTitle: string;
};

type ResultGroup = {
  title: string;
  entries: SearchResult[];
};

export type SearchViewModel = {
  state: SearchState;
  readonly labels: PageLoadData['editorialUI'];
  readonly filters: FilterChoice[];
  readonly groups: ResultGroup[];
  readonly status: string;
};

function optionLabel(
  key: keyof SearchFilters,
  value: string,
  page: PageLoadData,
): string {
  if (key === 'source') {
    if (value === 'lobby') {
      return 'Lobby';
    }

    return page.editorialUI[`source_${value}`] ?? value;
  }

  if (key === 'language') {
    return (
      page.languageRoutes.find((route): boolean => {
        return route.id === value;
      })?.label ?? value
    );
  }

  return page.editorialUI[value] ?? value;
}

function filterChoices(
  index: SearchItem[],
  page: PageLoadData,
): FilterChoice[] {
  const keys: (keyof SearchFilters)[] = [
    'source',
    'type',
    'language',
  ];

  return keys.map((key): FilterChoice => {
    const values = [
      ...new Set(
        index.map((entry): string => {
          return entry[key];
        }),
      ),
    ].sort();

    return {
      key,
      label: page.editorialUI[`search_${key}`] ?? '',
      options: values.map((value): FilterChoice['options'][number] => {
        return {
          value,
          label: optionLabel(key, value, page),
        };
      }),
    };
  });
}

function presentResult(
  entry: SearchItem,
  page: PageLoadData,
  origin: string,
): SearchResult {
  const result: SearchResult = {
    id: entry.id,
    title: entry.title,
    action: resolveDestination(
      page.config.site,
      {
        url: entry.url,
      },
      origin,
    ),
    origin: `${page.editorialUI['source'] ?? ''}: ${optionLabel('source', entry.source, page)} · ${page.editorialUI['language'] ?? ''}: ${optionLabel('language', entry.language, page)}`,
    detailsTitle: textOr(entry.details_label, entry.title),
  };

  if (entry.details_url) {
    result.details = resolveDestination(
      page.config.site,
      {
        url: entry.details_url,
      },
      origin,
    );
  }

  return result;
}

function resultGroups(
  results: SearchItem[],
  page: PageLoadData,
  origin: string,
): ResultGroup[] {
  return [
    ...Map.groupBy(results, (entry): string => {
      return entry.group;
    }),
  ].map((entryValue): ResultGroup => {
    const [
      title,
      entries,
    ] = entryValue;

    return {
      title,
      entries: entries.map((entry): SearchResult => {
        return presentResult(entry, page, origin);
      }),
    };
  });
}

function searchLabel(labels: PageLoadData['editorialUI'], key: string): string {
  return labels[key] ?? '';
}

function statusText(
  state: SearchState,
  count: number,
  labels: PageLoadData['editorialUI'],
): string {
  if (state.phase === 'loading') {
    return searchLabel(labels, 'search_loading');
  }

  if (state.phase === 'error') {
    return searchLabel(labels, 'search_unavailable');
  }

  if (!state.query.trim()) {
    return searchLabel(labels, 'search_start');
  }

  if (count > 0) {
    return String(count);
  }

  if (Object.values(state.filters)
    .some(Boolean)) {
    return searchLabel(labels, 'search_filtered_empty');
  }

  return searchLabel(labels, 'search_empty');
}

export function createSearchViewModel(
  currentPage: () => PageLoadData,
  currentOrigin: () => string,
): SearchViewModel {
  const state = $state(initialSearchState());

  const page = $derived(currentPage());

  const results = $derived(
    filterSearchItems(searchItems(state.index, state.query), state.filters),
  );

  const filters = $derived(filterChoices(state.index, page));

  const groups = $derived(resultGroups(results, page, currentOrigin()));

  const status = $derived(statusText(state, results.length, page.editorialUI));

  return {
    state,
    get labels(): PageLoadData['editorialUI'] {
      return page.editorialUI;
    },
    get filters(): FilterChoice[] {
      return filters;
    },
    get groups(): ResultGroup[] {
      return groups;
    },
    get status(): string {
      return status;
    },
  };
}
