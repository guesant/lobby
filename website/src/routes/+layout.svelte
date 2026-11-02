<script lang="ts">
  import type { BrowserEnvironment } from '#lib/browser/environment.ts';
  import {
    installBrowserEnvironment,
    updateVisibility,
  } from '#lib/browser/environment.ts';
  import {
    createBrowserNavigation,
    selectedLanguageID,
    updatePageChrome,
  } from '#lib/browser/navigation.ts';
  import type { LanguageNavigation } from '#lib/features/navigation/language.controller.ts';
  import { navigationPresentation } from '#lib/features/navigation/navigation.viewmodel.ts';
  import { createPreferenceController } from '#lib/features/preferences/preferences.controller.ts';
  import { provideInterfaceState } from '#lib/features/preferences/preferences.viewmodel.svelte.ts';
  import { afterNavigate, beforeNavigate } from '$app/navigation';
  import { page } from '$app/state';
  import type { Snippet } from 'svelte';
  import { onMount } from 'svelte';

  const {
    children,
  }: {
    children: Snippet;
  } = $props();

  const controls = provideInterfaceState();

  const preferences = createPreferenceController(controls);

  const presentation = $derived(navigationPresentation(page.data, page.status));

  let navigation: LanguageNavigation | undefined;

  let environment = $state.raw<BrowserEnvironment>();

  onMount((): (() => void) => {
    preferences.restore();
    environment = installBrowserEnvironment(controls);
    navigation = createBrowserNavigation((): typeof presentation => {
      return presentation;
    });

    return (): void => {
      navigation?.destroy();
      environment?.destroy();
    };
  });

  $effect((): void => {
    environment?.update(controls);
  });

  function keydown(event: KeyboardEvent): void {
    if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== 'k') {
      return;
    }

    event.preventDefault();

    if (controls.dialog === 'search') {
      controls.dialog = 'none';

      return;
    }

    controls.dialog = 'search';
  }

  function changeLanguage(event: Event): void {
    const id = selectedLanguageID(event);

    if (id) {
      void navigation?.select(id);
    }
  }

  beforeNavigate((event): void => {
    navigation?.beforeNavigate(event.to?.url ?? null);
  });
  afterNavigate((): void => {
    updatePageChrome(presentation);
    queueMicrotask((): void => {
      void navigation?.normalize();
    });
  });
</script>

<svelte:document
  onchange={changeLanguage}
  onvisibilitychange={updateVisibility}
/>
<svelte:window onkeydown={keydown} onstorage={preferences.restore} />
{@render children()}
