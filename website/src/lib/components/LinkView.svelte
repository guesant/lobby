<script lang="ts">
  import { tooltip } from '#lib/browser/tooltip.ts';
  import IconButton from '#lib/components/IconButton.svelte';
  import { changeLinkView } from '#lib/components/link-view-change.ts';
  import { createPreferenceController } from '#lib/features/preferences/preferences.controller.ts';
  import { interfaceState } from '#lib/features/preferences/preferences.viewmodel.svelte.ts';

  const state = interfaceState();

  const preferences = createPreferenceController(state);

  const {
    ui,
    pageKey,
    terminal = false,
  }: {
    ui: Record<string, string>;
    pageKey: string;
    terminal?: boolean;
  } = $props();
</script>

<fieldset class="link-view-control">
  <legend class="visually-hidden">{ui['link_view_label']}</legend>
  <div class="link-view-toolbar">
    <span class="link-view-caption" aria-hidden="true">
      {ui['link_view_label']}
    </span>
    {#if terminal}
      <span class="terminal-command" aria-hidden="true">
        $ ls ~/{pageKey}/
      </span>
    {/if}
    <div class="link-view-options">
      <input
        class="toggle-input"
        type="radio"
        name="link-view"
        id="link-view-compact"
        value="compact"
        data-link-view-control
        checked={state.view === 'compact'}
        onchange={changeLinkView.bind(null, preferences)}
      />
      <label
        class="toggle-button icon-control"
        for="link-view-compact"
        data-tooltip
        {@attach tooltip}
      >
        {#if terminal}
          <span>{ui['link_view_compact']}</span>
        {:else}
          <IconButton name="view-compact" />
          <span class="visually-hidden">{ui['link_view_compact']}</span>
          <span class="control-tooltip" aria-hidden="true">
            {ui['link_view_compact']}
          </span>
        {/if}
      </label>
      <input
        class="toggle-input"
        type="radio"
        name="link-view"
        id="link-view-detailed"
        value="detailed"
        data-link-view-control
        checked={state.view === 'detailed'}
        onchange={changeLinkView.bind(null, preferences)}
      />
      <label
        class="toggle-button icon-control"
        for="link-view-detailed"
        data-tooltip
        {@attach tooltip}
      >
        {#if terminal}
          <span>{ui['link_view_detailed']}</span>
        {:else}
          <IconButton name="view-detailed" />
          <span class="visually-hidden">{ui['link_view_detailed']}</span>
          <span class="control-tooltip" aria-hidden="true">
            {ui['link_view_detailed']}
          </span>
        {/if}
      </label>
    </div>
  </div>
</fieldset>
