<script lang="ts">
  import { createBootController } from './boot.controller.ts';
  import { bootModules } from './boot.model.ts';
  import { createBootViewModel } from './boot.viewmodel.svelte.ts';
  import type { BootControllerState } from './boot-controller.types.ts';
  import { cancelBoot } from './cancel-boot.ts';
  import { finishBootForReducedMotion } from './finish-boot-for-reduced-motion.ts';
  import { syncBootDialog } from './sync-boot-dialog.ts';
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

  const model = createBootViewModel();

  const step = $derived(model.step);

  const getProgress = (): string => {
    const length = Math.max(0, step - 17);

    return '█'.repeat(length);
  };

  const progress = $derived.by(getProgress);

  const runtime = $state<BootControllerState>({
    model,
    preferences,
    previous: null,
  });

  const actions = createBootController(runtime);

  const syncDialog = syncBootDialog.bind(null, runtime, preferences);

  const finishReducedMotion = finishBootForReducedMotion.bind(
    null,
    model,
    preferences,
    actions,
  );

  $effect(syncDialog);

  registerBootNavigation(actions.start);

  $effect(finishReducedMotion);
  onDestroy(actions.destroy);
</script>

<dialog
  bind:this={runtime.dialog}
  oncancel={cancelBoot.bind(null, actions)}
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
        <span data-bios-progress>{progress}</span>
        <span class="bios-cursor"></span>
      </p>
    </div>
    <p class="bios-announcement" id="bios-status" role="status">
      {ui['bios_status']}
    </p>
    <footer class="bios-footer">
      <button type="button" data-bios-skip onclick={actions.finish}>
        {ui['bios_skip']} · Esc
      </button>
      <span>Automatic startup sequence</span>
    </footer>
    <p class="bios-build-stamp">LOBBY-BOOT-5.0</p>
  </div>
</dialog>
