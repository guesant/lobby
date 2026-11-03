<script lang="ts">
  import type { PageLoadData } from '../features/content/content.types.ts';
  import AnalyticsTracker from '#lib/features/analytics/AnalyticsTracker.svelte';
  import ConsentDialog from '#lib/features/analytics/ConsentDialog.svelte';
  import BiosScreen from '#lib/features/boot/BiosScreen.svelte';
  import CreditsDialog from '#lib/features/content/CreditsDialog.svelte';
  import MetadataHead from '#lib/features/metadata/MetadataHead.svelte';
  import { interfaceState } from '#lib/features/preferences/preferences.viewmodel.svelte.ts';
  import SettingsDialog from '#lib/features/preferences/SettingsDialog.svelte';
  import SearchDialog from '#lib/features/search/SearchDialog.svelte';
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
<SettingsDialog {data} />
{#key data.locale + ':' + data.interfaceName}
  <SearchDialog {data} />
{/key}
<CreditsDialog {data} />
<ConsentDialog {data} />
<BiosScreen ui={data.editorialUI} />
