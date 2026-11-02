<script lang="ts">
  import type { PageLoadData } from '../features/content/content.types.ts';
  import BiosScreen from '#lib/features/boot/BiosScreen.svelte';
  import CreditsDialog from '#lib/features/content/CreditsDialog.svelte';
  import MetadataHead from '#lib/features/metadata/MetadataHead.svelte';
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
</script>

<MetadataHead {data} />
{@render children()}
<SettingsDialog {data} />
{#key data.locale + ':' + data.interfaceName}
  <SearchDialog {data} />
{/key}
<CreditsDialog {data} />
<BiosScreen ui={data.editorialUI} />
