<script lang="ts">
  import type { PageLoadData } from '../features/content/content.types.ts';
  import AnalyticsTracker from '#lib/features/analytics/AnalyticsTracker.svelte';
  import ConsentDialog from '#lib/features/analytics/ConsentDialog.svelte';
  import BiosScreen from '#lib/features/boot/BiosScreen.svelte';
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
</script>

<MetadataHead {data} />
<AnalyticsTracker
  consent={state.analyticsConsent}
  loaded={state.analyticsConsentLoaded}
  path={data.page.url}
/>
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
<ConsentDialog {data} />
<BiosScreen ui={data.editorialUI} />
