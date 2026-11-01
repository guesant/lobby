<script lang="ts">
  import IconButton from './IconButton.svelte';
  import { interfaceState, setPreference } from './preferences.svelte.ts';
  import { tooltip } from './tooltip.ts';

  const state = interfaceState();

  let {
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
  <legend class="visually-hidden">{ui.link_view_label}</legend>
  <div class="link-view-toolbar">
    <span class="link-view-caption" aria-hidden="true">
      {ui.link_view_label}
    </span>
    {#if terminal}<span class="terminal-command" aria-hidden="true">
      $ ls ~/{pageKey}/
    </span>{/if}
    <div class="link-view-options">
      <input
        class="toggle-input"
        type="radio"
        name="link-view"
        id="link-view-compact"
        value="compact"
        data-link-view-control
        checked={state.view === 'compact'}
        onchange={(event): void => {
          setPreference(state, 'view', event.currentTarget.value);
        }}
      />
      <label
        class="toggle-button icon-control"
        for="link-view-compact"
        data-tooltip
        {@attach tooltip}
      >
        {#if terminal}<span>{ui.link_view_compact}</span>{:else}<IconButton
          name="view-compact"
        />
          <span class="visually-hidden">{ui.link_view_compact}</span>
          <span class="control-tooltip" aria-hidden="true">
            {ui.link_view_compact}
          </span>{/if}
      </label>
      <input
        class="toggle-input"
        type="radio"
        name="link-view"
        id="link-view-detailed"
        value="detailed"
        data-link-view-control
        checked={state.view === 'detailed'}
        onchange={(event): void => {
          setPreference(state, 'view', event.currentTarget.value);
        }}
      />
      <label
        class="toggle-button icon-control"
        for="link-view-detailed"
        data-tooltip
        {@attach tooltip}
      >
        {#if terminal}<span>{ui.link_view_detailed}</span>{:else}<IconButton
          name="view-detailed"
        />
          <span class="visually-hidden">{ui.link_view_detailed}</span>
          <span class="control-tooltip" aria-hidden="true">
            {ui.link_view_detailed}
          </span>{/if}
      </label>
    </div>
  </div>
</fieldset>
