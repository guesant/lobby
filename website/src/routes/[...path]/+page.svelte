<script lang="ts">
  import type { PageData } from './$types';
  import SitePage from '#lib/app/SitePage.svelte';
  import MinecraftPage from '#lib/interfaces/minecraft/MinecraftPage.svelte';

  const {
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

<SitePage {data}><MinecraftPage {...data} /></SitePage>
