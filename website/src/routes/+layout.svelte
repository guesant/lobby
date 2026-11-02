<script lang="ts">
  import { updateVisibility } from '#lib/browser/environment.ts';
  import { afterLayoutNavigation } from '#lib/features/navigation/after-layout-navigation.ts';
  import { beforeLayoutNavigation } from '#lib/features/navigation/before-layout-navigation.ts';
  import { changeLayoutLanguage } from '#lib/features/navigation/change-layout-language.ts';
  import type { LayoutRuntime } from '#lib/features/navigation/layout-runtime.types.ts';
  import { mountLayout } from '#lib/features/navigation/mount-layout.ts';
  import { toggleSearchDialog } from '#lib/features/navigation/toggle-search-dialog.ts';
  import { updateLayoutEnvironment } from '#lib/features/navigation/update-layout-environment.ts';
  import { createPreferenceController } from '#lib/features/preferences/preferences.controller.ts';
  import { provideInterfaceState } from '#lib/features/preferences/preferences.viewmodel.svelte.ts';
  import { afterNavigate, beforeNavigate } from '$app/navigation';
  import type { Snippet } from 'svelte';
  import { onMount } from 'svelte';

  const {
    children,
  }: {
    children: Snippet;
  } = $props();

  const controls = provideInterfaceState();

  const preferences = createPreferenceController(controls);

  const runtime = $state<LayoutRuntime>({
    navigation: undefined,
    environment: undefined,
  });

  const mount = mountLayout.bind(null, runtime, controls, preferences);

  const updateEnvironment = updateLayoutEnvironment.bind(
    null,
    runtime,
    controls,
  );

  const beforeNavigation = beforeLayoutNavigation.bind(null, runtime);

  const afterNavigation = afterLayoutNavigation.bind(null, runtime);

  const updateLanguage = changeLayoutLanguage.bind(null, runtime);

  const openSearch = toggleSearchDialog.bind(null, controls);

  onMount(mount);
  $effect(updateEnvironment);
  beforeNavigate(beforeNavigation);
  afterNavigate(afterNavigation);
</script>

<svelte:document
  onchange={updateLanguage}
  onvisibilitychange={updateVisibility}
/>
<svelte:window onkeydown={openSearch} onstorage={preferences.restore} />
{@render children()}
