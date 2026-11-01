<script lang="ts">
  import SitePage from '$lib/SitePage.svelte';
  import MinecraftPage from '$lib/MinecraftPage.svelte';
  import type { PageData } from './$types';

  let {
    data,
  }: {
    data: PageData;
  } = $props();
</script>

<svelte:head>
  {#if data.isLanguageEntry}
    <noscript>
      <meta http-equiv="refresh" content={`0; url=${data.standardHomeURL}`} />
    </noscript>
  {/if}
</svelte:head>

<SitePage {data}><MinecraftPage {data} /></SitePage>
