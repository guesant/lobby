<script lang="ts">
  import type { PageLoadData } from '../content/content.types.ts';
  import { openDialog } from './open-dialog.controller.ts';
  import { createPreferenceController } from './preferences.controller.ts';
  import { settingsPresentation } from './settings.viewmodel.ts';
  import { settingsDialogClosed } from './settings-dialog-closed.ts';
  import { syncSettingsDialog } from './sync-settings-dialog.ts';
  import { updateSettings } from './update-settings.ts';
  import { dialogBackdrop } from '#lib/browser/dialog.ts';
  import { createBrowserInterfaceController } from '#lib/browser/interface-navigation.ts';
  import IconButton from '#lib/components/IconButton.svelte';
  import NavigationLink from '#lib/components/NavigationLink.svelte';
  import { measurementID } from '#lib/features/analytics/analytics.config.ts';
  import { interfaceState } from '#lib/features/preferences/preferences.viewmodel.svelte.ts';

  const {
    data,
  }: {
    data: PageLoadData;
  } = $props();

  const controls = interfaceState();

  const localized = $derived(data.localized);

  const preferences = createPreferenceController(controls);

  const getSettingsPresentation = (): ReturnType<
    typeof settingsPresentation
  > => {
    return settingsPresentation(data);
  };

  const model = $derived.by(getSettingsPresentation);

  const terminal = $derived(model.terminal);

  const editorialUI = $derived(data.editorialUI);

  const locale = $derived(data.locale);

  const interfaceActions = createBrowserInterfaceController(controls);

  const settingsActions = {
    preferences,
    interfaceActions,
  };

  const closeDialog = settingsDialogClosed.bind(null, controls);

  const changeSettings = updateSettings.bind(null, settingsActions);

  const dialogContext = $state<{
    dialog: HTMLDialogElement | undefined;
  }>({
    dialog: undefined,
  });

  const syncDialog = syncSettingsDialog.bind(null, dialogContext, controls);

  $effect(syncDialog);
</script>

<dialog
  bind:this={dialogContext.dialog}
  onclick={dialogBackdrop}
  onclose={closeDialog}
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
            data-setting="sound"
            checked={controls.sound === 'on'}
            onchange={changeSettings}
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
            data-setting="sound"
            checked={controls.sound === 'off'}
            onchange={changeSettings}
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
            data-setting="interface"
            data-interface-url={data.standardPageURL}
            checked={!terminal}
            onchange={updateSettings.bind(null, settingsActions)}
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
            data-setting="interface"
            data-interface-url={data.terminalPageURL}
            checked={terminal}
            onchange={updateSettings.bind(null, settingsActions)}
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
              data-setting="theme"
              checked={theme.value === controls.theme}
              onchange={changeSettings}
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
            data-setting="motion"
            checked={controls.motion === 'on'}
            onchange={changeSettings}
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
            data-setting="motion"
            checked={controls.motion === 'off'}
            onchange={changeSettings}
          />
          <label class="toggle-button" for="motion-off">
            {localized.ui['animations_disabled']}
          </label>
        </div>
      </div>
    </div>
    {#if measurementID}
      <button
        class="ui-button consent-settings-button"
        type="button"
        onclick={openDialog.bind(null, controls, 'consent')}
      >
        {localized.ui['analytics_consent_manage']}
      </button>
    {/if}
    <NavigationLink class="settings-privacy-link" href={data.privacyURL}>
      {localized.ui['privacy_policy']}
    </NavigationLink>
  </div>
</dialog>
