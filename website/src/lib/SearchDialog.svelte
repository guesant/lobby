<script lang="ts">
  import { onDestroy } from 'svelte';
  import IconButton from './IconButton.svelte';
  import { dialogBackdrop, showDialog } from './dialog.ts';
  import { interfaceState } from './preferences.svelte.ts';
  import {
    isSearchItem,
    searchItems,
    filterSearchItems,
    nextSearchResult,
    type SearchItem,
    type SearchFilters,
  } from './search.ts';
  import { resolveDestination } from './site-data.ts';
  import type { PageLoadData } from './site-data.ts';

  let {
    data,
  }: {
    data: PageLoadData;
  } = $props();

  const ui = interfaceState();

  let labels = $derived(data.editorialUI);

  let dialog = $state<HTMLDialogElement>();

  let input = $state<HTMLInputElement>();

  let phase = $state<'idle' | 'loading' | 'ready' | 'error'>('idle');

  let index = $state<SearchItem[]>([]);

  let query = $state('');

  let filters = $state<SearchFilters>({
    source: '',
    type: '',
    language: '',
  });

  const controller = new AbortController();

  onDestroy((): void => {
    controller.abort();
  });

  let results = $derived(filterSearchItems(searchItems(index, query), filters));

  let groups = $derived(
    Map.groupBy(results, (item): string => {
      return item.group;
    }),
  );

  let status = $derived.by((): string => {
    if (phase === 'loading') {
      return labels.search_loading || '';
    }

    if (phase === 'error') {
      return labels.search_unavailable || '';
    }

    if (!query.trim()) {
      return labels.search_start || '';
    }

    if (!results.length) {
      if (filters.source || filters.type || filters.language) {
        return labels.search_filtered_empty || '';
      }

      return labels.search_empty || '';
    }

    return String(results.length);
  });

  function choices(key: keyof SearchFilters): string[] {
    return [
      ...new Set(
        index.map((item): string => {
          return item[key];
        }),
      ),
    ].sort();
  }

  function filterLabel(key: keyof SearchFilters, value: string): string {
    if (key === 'source') {
      if (value === 'lobby') {
        return 'Lobby';
      }

      return labels[`source_${value}`] || value;
    }

    if (key === 'language') {
      return (
        data.languageRoutes.find((route): boolean => {
          return route.id === value;
        })?.label || value
      );
    }

    return labels[value] || value;
  }

  function clearFilters(): void {
    filters = {
      source: '',
      type: '',
      language: '',
    };
  }

  function close(): void {
    ui.dialog = 'none';
    clearFilters();
    query = '';
  }

  async function load(): Promise<void> {
    if (phase === 'loading') {
      return;
    }

    phase = 'loading';

    try {
      const response = await fetch(
        `/search/${data.locale}-${data.interfaceName}.json`,
        {
          signal: AbortSignal.any([
            controller.signal,
            AbortSignal.timeout(10000),
          ]),
        },
      );

      if (!response.ok) {
        throw new Error('Search unavailable');
      }

      const payload: unknown = await response.json();

      if (!Array.isArray(payload) || !payload.every(isSearchItem)) {
        throw new Error('Invalid search index');
      }

      index = payload;
      phase = 'ready';
    } catch {
      if (!controller.signal.aborted) {
        phase = 'error';
      }
    }
  }

  function keydown(event: KeyboardEvent): void {
    if (event.target instanceof HTMLSelectElement) {
      return;
    }

    if (event.key === 'Enter' && event.target === input) {
      dialog?.querySelector<HTMLAnchorElement>('#search-results a')
        ?.click();

      return;
    }

    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') {
      return;
    }

    const links = [
      ...(dialog?.querySelectorAll<HTMLAnchorElement>('#search-results a') ||
        []),
    ];

    if (!links.length) {
      return;
    }

    const current = links.findIndex((link): boolean => {
      return link === document.activeElement;
    });

    const next = nextSearchResult(current, event.key, links.length);

    event.preventDefault();
    links[next]?.focus();
  }

  $effect((): void => {
    const opened = ui.dialog === 'search';

    showDialog(dialog, opened);

    if (opened) {
      input?.focus();

      if (phase === 'idle') {
        void load();
      }
    }
  });
</script>

<dialog
  bind:this={dialog}
  class="app-dialog search-dialog"
  id="search-dialog"
  aria-labelledby="search-title"
  onclose={(): void => {
    if (!dialog?.open) {
      close();
    }
  }}
  oncancel={close}
  onclick={dialogBackdrop}
  onkeydown={keydown}
>
  <div class="app-dialog-content">
    <header class="app-dialog-header">
      <h2 id="search-title">{labels.search}</h2>
      <form method="dialog">
        <button
          type="submit"
          class="dialog-close"
          aria-label={data.localized.ui.settings_close}
        >
          <IconButton name="xmark" />
        </button>
      </form>
    </header>
    <label for="search-query" class="visually-hidden">{labels.search}</label>
    <input
      bind:this={input}
      bind:value={query}
      id="search-query"
      type="search"
      placeholder={labels.search_placeholder}
      autocomplete="off"
    />
    <p id="search-status" role="status" aria-live="polite">{status}</p>
    <div class="search-filters" role="group" aria-label={labels.search_filters}>
      {#each [
        'source',
        'type',
        'language'
      ] as key}
        {@const filter = key as keyof SearchFilters}
        <label>
          <span>{labels[`search_${filter}`]}</span>
          <select
            bind:value={filters[filter]}
            data-search-filter={filter}
            disabled={phase !== 'ready'}
          >
            <option value="">{labels.search_all}</option>
            {#each choices(filter) as choice}<option value={choice}>
              {filterLabel(filter, choice)}
            </option>{/each}
          </select>
        </label>
      {/each}
      <button type="button" data-search-clear onclick={clearFilters}>
        {labels.search_clear_filters}
      </button>
    </div>
    <button
      type="button"
      class="ui-button search-retry"
      data-search-retry
      hidden={phase !== 'error'}
      onclick={(): void => {
        void load();
      }}
    >
      {labels.search_retry}
    </button>
    <div id="search-results" aria-busy={phase === 'loading'}>
      {#each [
        ...groups
      ] as [
        group,
        items
      ]}
        <h3>{group}</h3>
        <ul>
          {#each items as item (item.id)}
            {@const action = resolveDestination(data.config.site, {
              url: item.url,
            })}
            <li>
              <a
                href={action.href}
                target={action.target}
                rel={action.rel}
                onclick={close}
              >
                {item.title}{#if action.external}<span
                  class="external-navigation-indicator"
                  aria-hidden="true"
                >
                  ↗
                </span>{/if}
              </a>
              <small>
                {labels.source}: {filterLabel('source', item.source)} · {labels.language}:
                {filterLabel('language', item.language)}
              </small>
              {#if item.details_url}
                {@const details = resolveDestination(data.config.site, {
                  url: item.details_url,
                })}
                <a
                  class="editorial-details"
                  href={details.href}
                  target={details.target}
                  rel={details.rel}
                  onclick={close}
                >
                  {item.details_label || item.title}{#if details.external}<span
                    class="external-navigation-indicator"
                    aria-hidden="true"
                  >
                    ↗
                  </span>{/if}
                </a>
              {/if}
            </li>
          {/each}
        </ul>
      {/each}
    </div>
  </div>
</dialog>

<style>
  .search-filters {
    --filter-minimum: 9rem;
    display: grid;
    grid-template-columns: repeat(
      auto-fit,
      minmax(min(100%, var(--filter-minimum)), 1fr)
    );
    align-items: end;
    gap: var(--space-3);
  }
  .search-filters label {
    display: grid;
    gap: var(--space-2);
    min-width: var(--space-0);
  }
  .search-filters select {
    width: var(--size-full);
    min-height: var(--control-min-height);
    padding: var(--space-2);
    font: inherit;
    color: inherit;
    background: var(--color-surface-link, var(--terminal-surface));
    border: var(--divider-width) solid
      var(--color-border-control, var(--terminal-border));
  }
</style>
