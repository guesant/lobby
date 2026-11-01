<script lang="ts">
  import { page } from '$app/state';
  import { afterNavigate, replaceState } from '$app/navigation';
  import { onDestroy } from 'svelte';
  import { interfaceState } from './preferences.svelte.ts';
  import { consumeBootRequest } from './interface-navigation.ts';

  let {
    ui,
  }: {
    ui: Record<string, string>;
  } = $props();

  const preferences = interfaceState();

  let dialog = $state<HTMLDialogElement>();

  let step = $state(0);

  let running = $state(false);

  let timer: ReturnType<typeof setTimeout> | undefined;

  let previous: HTMLElement | null = null;

  function finish(): void {
    clearTimeout(timer);
    timer = undefined;
    running = false;
    dialog?.close();

    if (previous?.isConnected) {
      previous.focus();
    }

    previous = null;
  }

  function advance(): void {
    step += 1;

    if (step >= 20) {
      finish();

      return;
    }

    timer = setTimeout(advance, 125);
  }

  function boot(): void {
    if (
      !dialog ||
      preferences.motion === 'off' ||
      matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    if (document.activeElement instanceof HTMLElement) {
      previous = document.activeElement;
    }

    preferences.dialog = 'none';
    clearTimeout(timer);
    step = 0;
    running = true;
    dialog.showModal();
    timer = setTimeout(advance, 125);
  }

  afterNavigate(({
    complete
  }): void => {
    void complete.then((): void => {
      const target = consumeBootRequest(new URL(window.location.href));

      if (!dialog?.isConnected || !target) {
        return;
      }

      replaceState(target, page.state);
      boot();
    });
  });
  $effect((): void => {
    if (
      running &&
      (preferences.motion === 'off' || preferences.reducedMotion)
    ) {
      finish();
    }
  });
  onDestroy((): void => {
    clearTimeout(timer);
  });
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
      {#each [
        'Navigation',
        'Content index',
        'User preferences',
        'Display controls'
      ] as item, index}<p
        class="bios-post-line bios-post-drive"
        data-bios-step={11 + index * 2}
        hidden={step < 11 + index * 2}
      >
        Module 0{index} : {item}
      </p>{/each}
      <p class="bios-boot-line" data-bios-boot-line hidden={step < 18}>
        Starting interface: <span data-bios-interface>
          {page.data.interfaceName}
        </span>
        <span data-bios-progress>{'█'.repeat(Math.max(0, step - 17))}</span>
        <span class="bios-cursor"></span>
      </p>
    </div>
    <p class="bios-announcement" id="bios-status" role="status">
      {ui.bios_status}
    </p>
    <footer class="bios-footer">
      <button type="button" data-bios-skip onclick={finish}>
        {ui.bios_skip} · Esc
      </button>
      <span>Automatic startup sequence</span>
    </footer>
    <p class="bios-build-stamp">LOBBY-BOOT-5.0</p>
  </div>
</dialog>
