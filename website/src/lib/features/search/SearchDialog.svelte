<script lang="ts">
  import type { PageLoadData } from '../content/content.types.ts';
  import { createSearchController } from './search.controller.ts';
  import { createSearchViewModel } from './search.viewmodel.svelte.ts';
  import { dialogBackdrop, showDialog } from '#lib/browser/dialog.ts';
  import { navigationOrigin } from '#lib/browser/origin.ts';
  import { searchKeydown } from '#lib/browser/search-keyboard.ts';
  import IconButton from '#lib/components/IconButton.svelte';
  import NavigationLink from '#lib/components/NavigationLink.svelte';
  import { interfaceState } from '#lib/features/preferences/preferences.viewmodel.svelte.ts';
  import { onDestroy } from 'svelte';

  const {
    data,
  }: {
    data: PageLoadData;
  } = $props();

  const ui = interfaceState();

  const model = createSearchViewModel((): PageLoadData => {
    return data;
  }, navigationOrigin);

  const actions = createSearchController(model.state, {
    indexURL(): string {
      return `/search/${data.locale}-${data.interfaceName}.json`;
    },
    closeDialog(): void {
      ui.dialog = 'none';
    },
  });

  let dialog = $state<HTMLDialogElement>();

  let input = $state<HTMLInputElement>();

  function keydown(event: KeyboardEvent): void {
    searchKeydown(event, {
      dialog,
      input,
    });
  }

  $effect((): void => {
    const opened = ui.dialog === 'search';

    showDialog(dialog, opened);

    if (opened) {
      input?.focus();
      void actions.prepare();
    }
  });

  onDestroy(actions.destroy);
</script>

<dialog
  bind:this={dialog}
  class="app-dialog search-dialog"
  id="search-dialog"
  aria-labelledby="search-title"
  onclose={(): void => {
    if (!dialog?.open) {
      actions.close();
    }
  }}
  oncancel={actions.close}
  onclick={dialogBackdrop}
  onkeydown={keydown}
>
  <div class="app-dialog-content">
    <header class="app-dialog-header">
      <h2 id="search-title">{model.labels['search']}</h2>
      <form method="dialog">
        <button
          type="submit"
          class="dialog-close"
          aria-label={data.localized.ui['settings_close']}
        >
          <IconButton name="xmark" />
        </button>
      </form>
    </header>
    <label for="search-query" class="visually-hidden">
      {model.labels['search']}
    </label>
    <input
      bind:this={input}
      bind:value={model.state.query}
      id="search-query"
      type="search"
      placeholder={model.labels['search_placeholder']}
      autocomplete="off"
    />
    <p id="search-status" role="status" aria-live="polite">{model.status}</p>
    <div
      class="search-filters"
      role="group"
      aria-label={model.labels['search_filters']}
    >
      {#each model.filters as filter (filter.key)}
        <label>
          <span>{filter.label}</span>
          <select
            bind:value={model.state.filters[filter.key]}
            data-search-filter={filter.key}
            disabled={model.state.phase !== 'ready'}
          >
            <option value="">{model.labels['search_all']}</option>
            {#each filter.options as choice (choice.value)}
              <option value={choice.value}>{choice.label}</option>
            {/each}
          </select>
        </label>
      {/each}
      <button type="button" data-search-clear onclick={actions.clearFilters}>
        {model.labels['search_clear_filters']}
      </button>
    </div>
    <button
      type="button"
      class="ui-button search-retry"
      data-search-retry
      hidden={model.state.phase !== 'error'}
      onclick={(): void => {
        void actions.load();
      }}
    >
      {model.labels['search_retry']}
    </button>
    <div id="search-results" aria-busy={model.state.phase === 'loading'}>
      {#each model.groups as group (group.title)}
        <h3>{group.title}</h3>
        <ul>
          {#each group.entries as result (result.id)}
            <li>
              <NavigationLink
                href={result.action.href}
                target={result.action.target}
                rel={result.action.rel}
                onclick={actions.close}
              >
                {result.title}
                {#if result.action.external}
                  <span
                    class="external-navigation-indicator"
                    aria-hidden="true"
                  >
                    ↗
                  </span>
                {/if}
              </NavigationLink>
              <small>{result.origin}</small>
              {#if result.details}
                <NavigationLink
                  class="editorial-details"
                  href={result.details.href}
                  target={result.details.target}
                  rel={result.details.rel}
                  onclick={actions.close}
                >
                  {result.detailsTitle}
                  {#if result.details.external}
                    <span
                      class="external-navigation-indicator"
                      aria-hidden="true"
                    >
                      ↗
                    </span>
                  {/if}
                </NavigationLink>
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
