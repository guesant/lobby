<script lang="ts">
  import { createBootController } from './boot.controller.ts';
  import { bootModules } from './boot.model.ts';
  import { createBootViewModel } from './boot.viewmodel.svelte.ts';
  import { registerBootNavigation } from '#lib/browser/boot-navigation.ts';
  import { interfaceState } from '#lib/features/preferences/preferences.viewmodel.svelte.ts';
  import { page } from '$app/state';
  import { onDestroy } from 'svelte';

  const {
    ui,
  }: {
    ui: Record<string, string>;
  } = $props();

  const preferences = interfaceState();

  let dialog = $state<HTMLDialogElement>();

  const model = createBootViewModel();

  const step = $derived(model.step);

  const actions = createBootController(model, {
    canStart(): boolean {
      return (
        Boolean(dialog?.isConnected) &&
        preferences.motion !== 'off' &&
        !preferences.reducedMotion
      );
    },
  });

  let previous: HTMLElement | null = null;

  function finish(): void {
    actions.finish();
  }

  $effect((): void => {
    if (!dialog) {
      return;
    }

    if (model.running) {
      if (document.activeElement instanceof HTMLElement) {
        previous = document.activeElement;
      }

      preferences.dialog = 'none';
      dialog.showModal();

      return;
    }

    dialog.close();

    if (previous?.isConnected) {
      previous.focus();
    }

    previous = null;
  });

  registerBootNavigation(actions.start);

  $effect((): void => {
    if (
      model.running &&
      (preferences.motion === 'off' || preferences.reducedMotion)
    ) {
      finish();
    }
  });
  onDestroy(actions.destroy);
</script>

<dialog
  bind:this={dialog}
  oncancel={(event): void => {
    event.preventDefault();
    finish();
  }}
  id="bios-dialog"
  class="bios-dialog"
  aria-labelledby="bios-title"
  aria-describedby="bios-status"
>
  <div class="bios-screen">
    <header class="bios-header">
      <h2 id="bios-title">
        GuesantBIOS v5.0
        <br />
        Interface initialization monitor
      </h2>
      <span class="bios-status-badge">STARTUP CHECK</span>
    </header>
    <div class="bios-post" aria-hidden="true">
      <p class="bios-post-line" data-bios-step="1" hidden={step < 1}>
        Runtime loader : Ready
      </p>
      <p class="bios-post-line" data-bios-step="4" hidden={step < 4}>
        Configuration : Loaded
      </p>
      <p
        class="bios-post-line bios-post-muted"
        data-bios-step="8"
        hidden={step < 8}
      >
        Checking interface modules ...
      </p>
      {#each bootModules as item, index (item)}
        <p
          class="bios-post-line bios-post-drive"
          data-bios-step={11 + index * 2}
          hidden={step < 11 + index * 2}
        >
          Module 0{index} : {item}
        </p>
      {/each}
      <p class="bios-boot-line" data-bios-boot-line hidden={step < 18}>
        Starting interface: <span data-bios-interface>
          {page.data.interfaceName}
        </span>
        <span data-bios-progress>{'█'.repeat(Math.max(0, step - 17))}</span>
        <span class="bios-cursor"></span>
      </p>
    </div>
    <p class="bios-announcement" id="bios-status" role="status">
      {ui['bios_status']}
    </p>
    <footer class="bios-footer">
      <button type="button" data-bios-skip onclick={finish}>
        {ui['bios_skip']} · Esc
      </button>
      <span>Automatic startup sequence</span>
    </footer>
    <p class="bios-build-stamp">LOBBY-BOOT-5.0</p>
  </div>
</dialog>
