<script lang="ts">
  import type { PageLoadData } from '../content/content.types.ts';
  import { createPreferenceController } from './preferences.controller.ts';
  import { settingsPresentation } from './settings.viewmodel.ts';
  import { dialogBackdrop, showDialog } from '#lib/browser/dialog.ts';
  import { createBrowserInterfaceController } from '#lib/browser/interface-navigation.ts';
  import IconButton from '#lib/components/IconButton.svelte';
  import { interfaceState } from '#lib/features/preferences/preferences.viewmodel.svelte.ts';

  const {
    data,
  }: {
    data: PageLoadData;
  } = $props();

  const controls = interfaceState();

  const localized = $derived(data.localized);

  const preferences = createPreferenceController(controls);

  const model = $derived(settingsPresentation(data));

  const terminal = $derived(model.terminal);

  const editorialUI = $derived(data.editorialUI);

  const locale = $derived(data.locale);

  let settingsDialog = $state<HTMLDialogElement>();

  const interfaceActions = createBrowserInterfaceController(
    (): PageLoadData => {
      return data;
    },
    (): void => {
      controls.dialog = 'none';
    },
  );

  $effect((): void => {
    showDialog(settingsDialog, controls.dialog === 'settings');
  });
</script>

<dialog
  bind:this={settingsDialog}
  onclick={dialogBackdrop}
  onclose={(): void => {
    if (!settingsDialog?.open && controls.dialog === 'settings') {
      controls.dialog = 'none';
    }
  }}
  class="app-dialog settings-dialog"
  id="settings-dialog"
  aria-labelledby="settings-dialog-title"
>
  <div class="app-dialog-content settings-content">
    <header class="app-dialog-header">
      <h2 id="settings-dialog-title">
        <IconButton name="gear" />
        <span>{localized.ui['settings_label']}</span>
      </h2>
      <form method="dialog">
        <button
          class="dialog-close"
          type="submit"
          data-dialog-close
          aria-label={localized.ui['settings_close']}
        >
          <IconButton name="xmark" />
        </button>
      </form>
    </header>
    <div class="site-controls">
      <div class="toggle-control sound-control">
        <span class="toggle-label" id="sound-label">
          {editorialUI['sound']}
        </span>
        <div
          class="toggle-group"
          role="radiogroup"
          aria-labelledby="sound-label"
        >
          <input
            class="toggle-input"
            type="radio"
            name="sound"
            id="sound-on"
            value="on"
            data-sound-option
            checked={controls.sound === 'on'}
            onchange={(event): void => {
              preferences.set('sound', event.currentTarget.value);
            }}
          />
          <label class="toggle-button" for="sound-on">
            {editorialUI['sound_on']}
          </label>
          <input
            class="toggle-input"
            type="radio"
            name="sound"
            id="sound-off"
            value="off"
            data-sound-option
            checked={controls.sound === 'off'}
            onchange={(event): void => {
              preferences.set('sound', event.currentTarget.value);
            }}
          />
          <label class="toggle-button" for="sound-off">
            {editorialUI['sound_off']}
          </label>
        </div>
      </div>
      <div class="toggle-control interface-control">
        <span class="toggle-label" id="interface-label">
          {editorialUI['interface']}
        </span>
        <div
          class="toggle-group"
          role="radiogroup"
          aria-labelledby="interface-label"
        >
          <input
            class="toggle-input"
            type="radio"
            name="interface"
            id="interface-minecraft"
            value="minecraft"
            data-interface-option
            data-interface-url={data.standardPageURL}
            checked={!terminal}
            onchange={(event): void => {
              void interfaceActions.select(event.currentTarget.value);
            }}
          />
          <label class="toggle-button" for="interface-minecraft">
            Minecraft
          </label>
          <input
            class="toggle-input"
            type="radio"
            name="interface"
            id="interface-terminal"
            value="terminal"
            data-interface-option
            data-interface-url={data.terminalPageURL}
            checked={terminal}
            onchange={(event): void => {
              void interfaceActions.select(event.currentTarget.value);
            }}
          />
          <label class="toggle-button" for="interface-terminal">Terminal</label>
        </div>
      </div>
      <div class="toggle-control language-control">
        <span class="toggle-label" id="language-label">
          <IconButton name="language" />
          <span>{localized.ui['language_aria_label']}</span>
        </span>
        <div class="language-select-wrap">
          <select
            class="language-select"
            aria-labelledby="language-label"
            data-language-switcher
          >
            {#each model.languageRoutes as option (option.id)}
              <option
                value={option.url}
                data-language={option.id}
                selected={option.id === locale}
              >
                {option.label}
              </option>
            {/each}
          </select>
          <span class="language-select-icon">
            <IconButton name="chevron-right" />
          </span>
        </div>
      </div>
      <div class="toggle-control">
        <span class="toggle-label" id="theme-label">
          {localized.ui['theme_label']}
        </span>
        <div
          class="toggle-group"
          role="radiogroup"
          aria-labelledby="theme-label"
        >
          {#each model.themes as theme (theme.value)}
            <input
              class="toggle-input"
              type="radio"
              name="theme"
              id="theme-{theme.value}"
              value={theme.value}
              data-theme-option
              checked={theme.value === controls.theme}
              onchange={(event): void => {
                preferences.set('theme', event.currentTarget.value);
              }}
            />
            <label class="toggle-button" for="theme-{theme.value}">
              {theme.label}
            </label>
          {/each}
        </div>
      </div>
      <div class="toggle-control motion-control">
        <span class="toggle-label" id="motion-label">
          {localized.ui['animations_label']}
        </span>
        <div
          class="toggle-group toggle-group-motion"
          role="radiogroup"
          aria-labelledby="motion-label"
        >
          <input
            class="toggle-input"
            type="radio"
            name="motion"
            id="motion-on"
            value="on"
            data-motion-option
            checked={controls.motion === 'on'}
            onchange={(event): void => {
              preferences.set('motion', event.currentTarget.value);
            }}
          />
          <label class="toggle-button" for="motion-on">
            {localized.ui['animations_enabled']}
          </label>
          <input
            class="toggle-input"
            type="radio"
            name="motion"
            id="motion-off"
            value="off"
            data-motion-option
            checked={controls.motion === 'off'}
            onchange={(event): void => {
              preferences.set('motion', event.currentTarget.value);
            }}
          />
          <label class="toggle-button" for="motion-off">
            {localized.ui['animations_disabled']}
          </label>
        </div>
      </div>
    </div>
  </div>
</dialog>
