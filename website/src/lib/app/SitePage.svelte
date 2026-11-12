<script lang="ts">
  import type { PageLoadData } from '../features/content/content.types.ts';
  import { getBootRequest } from '#lib/features/boot/get-boot-request.ts';
  import MetadataHead from '#lib/features/metadata/MetadataHead.svelte';
  import { interfaceState } from '#lib/features/preferences/preferences.viewmodel.svelte.ts';
  import type { Snippet } from 'svelte';

  const {
    data,
    children,
  }: {
    data: PageLoadData;
    children: Snippet;
  } = $props();

  const state = interfaceState();

  const bootRequested = $derived.by(getBootRequest);
</script>

<MetadataHead {data} />
{#if state.analyticsConsentLoaded && state.analyticsConsent === 'granted'}
  {#await import('../features/analytics/AnalyticsTracker.svelte') then {
    default: AnalyticsTracker
  }}
    <AnalyticsTracker
      consent={state.analyticsConsent}
      loaded={state.analyticsConsentLoaded}
      path={data.page.url}
    />
  {/await}
{/if}
{@render children()}
{#if state.dialog === 'settings'}
  {#await import('../features/preferences/SettingsDialog.svelte') then {
    default: SettingsDialog
  }}
    <SettingsDialog {data} />
  {/await}
{/if}
{#if state.dialog === 'search'}
  {#key data.locale + ':' + data.interfaceName}
    {#await import('../features/search/SearchDialog.svelte') then {
      default: SearchDialog
    }}
      <SearchDialog {data} />
    {/await}
  {/key}
{/if}
{#if state.dialog === 'credits'}
  {#await import('../features/content/CreditsDialog.svelte') then {
    default: CreditsDialog
  }}
    <CreditsDialog {data} />
  {/await}
{/if}
{#await import('../features/analytics/ConsentDialog.svelte') then {
  default: ConsentDialog
}}
  <ConsentDialog {data} />
{/await}
{#if bootRequested}
  {#await import('../features/boot/BiosScreen.svelte') then {
    default: BiosScreen
  }}
    <BiosScreen ui={data.editorialUI} />
  {/await}
{/if}
